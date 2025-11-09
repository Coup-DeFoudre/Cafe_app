'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { PLACEHOLDER_IMAGES } from '@/lib/constants';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function CartSheet() {
  const router = useRouter();
  const { 
    items, 
    itemCount, 
    subtotal, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem 
  } = useCart();

  const handleProceedToCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription className="sr-only">
            Review your selected items and proceed to checkout
          </SheetDescription>
          {itemCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add some delicious items to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.menuItemId}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        <Image
                          src={item.image || PLACEHOLDER_IMAGES.menuItem}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={item.isVeg ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {item.isVeg ? "VEG" : "NON-VEG"}
                              </Badge>
                              <span className="text-sm font-medium">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.menuItemId)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tax and delivery charges will be calculated at checkout
              </p>
            </div>

            <SheetFooter className="gap-2 pt-4">
              <Button
                variant="outline"
                onClick={closeCart}
                className="flex-1"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={handleProceedToCheckout}
                disabled={items.length === 0}
                className="flex-1"
              >
                Proceed to Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}