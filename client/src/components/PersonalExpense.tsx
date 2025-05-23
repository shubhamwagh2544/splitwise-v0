import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, Clock, CreditCard, Receipt, Trash2, Users, Wallet, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import api from '@/apis/axios.ts';

interface ExpenseUser {
    userId: number;
    expenseId: number;
    isLender: boolean;
    isSettled: boolean;
    amountOwed: number;
    fullName: string;
    email: string;
}

interface Expense {
    id: number;
    name: string;
    description?: string;
    amount: number;
    isSettled: boolean;
    createdAt: string;
    users: ExpenseUser[];
}

interface Account {
    id: string;
    accountName: string;
    balance: number;
}

export default function PersonalExpense() {
    const { roomId, expenseId } = useParams();
    const navigate = useNavigate();
    const [expense, setExpense] = useState<Expense | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedBorrower, setSelectedBorrower] = useState<ExpenseUser | null>(null);
    const [allUsersSettled, setAllUsersSettled] = useState(false);
    const [isDeleteExpenseDialogOpen, setIsDeleteExpenseDialogOpen] = useState(false);
    const [userAccounts, setUserAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    useEffect(() => {
        async function fetchExpense() {
            try {
                const response = await api.get(`/expense/room/${roomId}/expense/${expenseId}`);
                setExpense(response.data);
            } catch (error) {
                console.error('Error fetching expense:', error);
                toast.error('Failed to load expense details');
            } finally {
                setLoading(false);
            }
        }

        fetchExpense().then((error) => console.error('Failed to load personal expense', error));
    }, [expenseId, roomId]);

    useEffect(() => {
        if (expense) {
            const borrowers = expense.users.filter((user) => !user.isLender);
            const allSettled = borrowers.every((user) => user.isSettled);
            setAllUsersSettled(allSettled);
        }
    }, [expense]);

    useEffect(() => {
        async function fetchUserAccounts() {
            try {
                const response = await api.get(`/account/user/${userId}`);
                setUserAccounts(response.data);
            } catch (error) {
                console.error('Error fetching user accounts:', error);
                toast.error('Failed to load accounts');
            }
        }

        fetchUserAccounts().then((error) => console.error('Failed to load user accounts', error));
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!expense) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">Expense Not Found</h2>
                <Button variant="outline" onClick={() => navigate(`/room/${roomId}`)} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const lender = expense.users.find((user) => user.isLender);
    const borrowers = expense.users.filter((user) => !user.isLender);
    const isLender = lender?.userId === Number(userId);

    const handleSettleUp = (borrower: ExpenseUser) => {
        setSelectedBorrower(borrower);
        setIsPaymentDialogOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!selectedBorrower || !selectedAccount) {
            toast.error('Please select an account to pay from');
            return;
        }

        try {
            const response = await api.put(`/expense/room/${roomId}/expense/${expenseId}`, {
                userId: selectedBorrower.userId,
                amount: selectedBorrower.amountOwed,
                accountId: parseInt(selectedAccount),
            });

            if (response.status === 200) {
                toast.success('Payment processed successfully');
                setIsPaymentDialogOpen(false);
                // Refresh expense data
                const updatedResponse = await api.get(`/expense/room/${roomId}/expense/${expenseId}`);
                setExpense(updatedResponse.data);
            }
        } catch (error: any) {
            console.error('Error processing payment:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to process payment');
            }
        }
    };

    async function handleSettleExpense() {
        if (!expense) return;

        try {
            const response = await api.put(`/expense/${expense.id}/settle`);

            if (response.status === 200) {
                toast.success('Expense settled successfully');
                // Refresh expense data
                const updatedResponse = await api.get(`/expense/room/${roomId}/expense/${expenseId}`);
                setExpense(updatedResponse.data);
            }
        } catch (error) {
            console.error('Error settling expense:', error);
            toast.error('Failed to settle expense');
        }
    }

    async function handleDeleteExpense() {
        try {
            const response = await api.delete(`/expense/${expenseId}`);

            if (response?.data.includes('Delete Successful') && response?.status === 200) {
                toast.success('Expense deleted successfully');
                navigate(`/room/${roomId}`);
            }
        } catch (error: AxiosError | any) {
            if (error.response?.status === 409 || error.response?.status === 404) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to delete expense');
            }
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{expense.name}</h1>
                            {expense.description && <p className="text-muted-foreground">{expense.description}</p>}
                        </div>
                    </div>
                    {isLender && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setIsDeleteExpenseDialogOpen(true)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Expense Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Receipt className="h-5 w-5" />
                                <span>Expense Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Amount</span>
                                <Badge variant="default" className="text-lg">
                                    ${expense.amount}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Date</span>
                                <Badge variant="outline">{new Date(expense.createdAt).toLocaleDateString()}</Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={expense.isSettled ? 'success' : 'secondary'}>
                                    {expense.isSettled ? (
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-1" />
                                    )}
                                    {expense.isSettled ? 'Settled' : 'Pending'}
                                </Badge>
                            </div>

                            {isLender && !expense.isSettled && (
                                <>
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Settlement Status</h3>
                                        <div className="rounded-lg bg-muted p-4">
                                            {allUsersSettled ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center text-green-600">
                                                        <CheckCircle className="h-5 w-5 mr-2" />
                                                        <span className="font-medium">
                                                            All users have settled their dues
                                                        </span>
                                                    </div>
                                                    <Button
                                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                                        onClick={handleSettleExpense}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Settle Expense
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-yellow-600">
                                                    <Clock className="h-5 w-5 mr-2" />
                                                    <span className="font-medium">
                                                        Waiting for all users to settle their dues
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-medium">Paid by</h3>
                                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        {lender?.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{lender?.fullName}</p>
                                        <p className="text-sm text-muted-foreground">{lender?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Borrowers Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Split Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-4">
                                    {borrowers.map((borrower) => (
                                        <motion.div
                                            key={borrower.userId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-lg border hover:border-primary/20 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        {borrower.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{borrower.fullName}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {borrower.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <Badge variant={borrower.isSettled ? 'success' : 'destructive'}>
                                                        ${Number(borrower.amountOwed).toFixed(2)}
                                                    </Badge>
                                                    {!borrower.isSettled && borrower.userId === Number(userId) && (
                                                        <Button
                                                            onClick={() => handleSettleUp(borrower)}
                                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm"
                                                        >
                                                            <CreditCard className="h-4 w-4 mr-2" />
                                                            SettleUp
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-br from-background to-muted/50">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl">Confirm Payment</DialogTitle>
                        <DialogDescription>Select an account and confirm your payment</DialogDescription>
                    </DialogHeader>

                    {selectedBorrower && (
                        <div className="px-6 py-4 space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                                <p className="text-2xl font-bold text-primary">${selectedBorrower.amountOwed}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Account</Label>
                                <ScrollArea className="h-[200px] rounded-md border p-4">
                                    <div className="space-y-2">
                                        {userAccounts.length === 0 ? (
                                            <div className="text-center py-4">
                                                <Wallet className="h-8 w-8 mx-auto text-muted-foreground/50" />
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    No accounts available
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => navigate('/main-room')}
                                                >
                                                    Add Account
                                                </Button>
                                            </div>
                                        ) : (
                                            userAccounts.map((account) => (
                                                <div
                                                    key={account.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                                        selectedAccount === account.id
                                                            ? 'bg-primary/10 border-primary'
                                                            : 'hover:bg-accent'
                                                    }`}
                                                    onClick={() => setSelectedAccount(account.id)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Wallet className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{account.accountName}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Balance: ${Number(account.balance).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {selectedAccount === account.id && (
                                                        <CheckCircle className="h-4 w-4 text-primary" />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsPaymentDialogOpen(false);
                                    setSelectedAccount(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmPayment}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                disabled={!selectedAccount || userAccounts.length === 0}
                            >
                                <Wallet className="h-4 w-4 mr-2" />
                                Pay from Account
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Expense Confirmation Dialog */}
            <Dialog open={isDeleteExpenseDialogOpen} onOpenChange={setIsDeleteExpenseDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 gap-0">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl text-red-600">Delete Expense</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this expense? This action cannot be undone.
                            {expense && !expense.isSettled && (
                                <p className="mt-2 text-red-500">Note: This expense must be settled before deletion.</p>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="p-6 pt-4 bg-muted/40">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={() => setIsDeleteExpenseDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    await handleDeleteExpense();
                                    setIsDeleteExpenseDialogOpen(false);
                                }}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Expense
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
