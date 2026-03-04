import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { cartItems, experiences } from "@/db/schema";

export async function getCart(userId: string) {
  return db
    .select({
      id: cartItems.id,
      userId: cartItems.userId,
      experienceId: cartItems.experienceId,
      quantity: cartItems.quantity,
      selectedDate: cartItems.selectedDate,
      selectedTime: cartItems.selectedTime,
      createdAt: cartItems.createdAt,
      title: experiences.title,
      price: experiences.price,
      imageUrl: experiences.imageUrl,
    })
    .from(cartItems)
    .innerJoin(experiences, eq(cartItems.experienceId, experiences.id))
    .where(eq(cartItems.userId, userId));
}

export async function addToCart(
  userId: string,
  experienceId: string,
  quantity: number,
  selectedDate?: Date,
  selectedTime?: string
) {
  const [item] = await db
    .insert(cartItems)
    .values({ userId, experienceId, quantity, selectedDate, selectedTime })
    .returning();
  return item;
}

export async function updateCartItem(
  id: string,
  userId: string,
  quantity: number
) {
  const [item] = await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)))
    .returning();
  return item;
}

export async function removeFromCart(id: string, userId: string) {
  const [item] = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)))
    .returning();
  return item;
}

export async function clearCart(userId: string) {
  return db.delete(cartItems).where(eq(cartItems.userId, userId));
}
