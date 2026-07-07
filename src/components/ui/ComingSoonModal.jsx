import React from 'react';
import Icon from '../AppIcon';
import { motion, AnimatePresence } from 'framer-motion';

const ComingSoonModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-sm overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                        >
                            <Icon name="X" size={20} />
                        </button>

                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                            {/* Logo/Icon Container */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                <div className="relative w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                                    <Icon name="Rocket" size={40} className="text-primary" />
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                    Coming Soon
                                </h2>
                                <p className="text-muted-foreground max-w-[280px] mx-auto">
                                    We're working hard to bring you this feature. Stay tuned for updates!
                                </p>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={onClose}
                                className="w-full max-w-xs py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                Got it
                            </button>
                        </div>

                        {/* Decorative bottom bar */}
                        <div className="h-1.5 w-full bg-primary" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ComingSoonModal;
