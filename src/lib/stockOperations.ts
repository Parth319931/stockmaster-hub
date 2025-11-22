import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Validates a receipt and updates stock levels atomically
 */
export async function validateReceipt(receiptId: string, userId: string) {
  try {
    const { error } = await supabase.rpc('validate_receipt', {
      receipt_id_param: receiptId,
      validator_id: userId
    });

    if (error) throw error;

    toast.success("Receipt validated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Error validating receipt:", error);
    toast.error(error.message || "Failed to validate receipt");
    return { success: false, error };
  }
}

/**
 * Validates a delivery and updates stock levels atomically
 * Prevents negative stock
 */
export async function validateDelivery(deliveryId: string, userId: string) {
  try {
    const { error } = await supabase.rpc('validate_delivery', {
      delivery_id_param: deliveryId,
      validator_id: userId
    });

    if (error) throw error;

    toast.success("Delivery validated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Error validating delivery:", error);
    toast.error(error.message || "Failed to validate delivery");
    return { success: false, error };
  }
}

/**
 * Validates a transfer and updates stock levels atomically
 * Moves stock from source to destination location
 */
export async function validateTransfer(transferId: string, userId: string) {
  try {
    const { error } = await supabase.rpc('validate_transfer', {
      transfer_id_param: transferId,
      validator_id: userId
    });

    if (error) throw error;

    toast.success("Transfer validated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Error validating transfer:", error);
    toast.error(error.message || "Failed to validate transfer");
    return { success: false, error };
  }
}

/**
 * Validates an adjustment and updates stock levels atomically
 * Sets stock to physical count
 */
export async function validateAdjustment(adjustmentId: string, userId: string) {
  try {
    const { error } = await supabase.rpc('validate_adjustment', {
      adjustment_id_param: adjustmentId,
      validator_id: userId
    });

    if (error) throw error;

    toast.success("Adjustment validated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Error validating adjustment:", error);
    toast.error(error.message || "Failed to validate adjustment");
    return { success: false, error };
  }
}
