"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import AuthForm from "./AuthForm";

interface SignUpDialogProps {
    children: React.ReactNode; // To wrap the trigger element
}

export default function SignUpDialog({ children }: SignUpDialogProps) {
     const [open, setOpen] = React.useState(false);

    // Sign up requires email verification, so maybe don't auto-close,
    // or close and show a "Check email" message elsewhere.
    // For now, let's close it on success (button click).
    const handleSuccess = () => {
        setOpen(false);
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0">
                <AuthForm mode="signup" onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}

