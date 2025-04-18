"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import AuthForm from "./AuthForm";

interface SignInDialogProps {
    children: React.ReactNode; // To wrap the trigger element
}

export default function SignInDialog({ children }: SignInDialogProps) {
    const [open, setOpen] = React.useState(false);

    const handleSuccess = () => {
        setOpen(false); // Close dialog on successful sign in
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0">
                 {/* Remove DialogHeader if AuthForm provides its own */}
                <AuthForm mode="signin" onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}
