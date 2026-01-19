import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function generateLicenseKey(): string {
  // Generate a unique license key: 4 groups of 4 uppercase alphanumeric characters
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing characters like 0, O, I, 1
  const groups: string[] = [];
  
  for (let i = 0; i < 4; i++) {
    let group = "";
    for (let j = 0; j < 4; j++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      group += chars[randomIndex];
    }
    groups.push(group);
  }
  
  return groups.join("-");
}

export async function GET(request: Request) {
  try {
    // Get secret from query parameters
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Verify secret matches NEXTAUTH_SECRET
    if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid secret" },
        { status: 401 }
      );
    }

    // Generate license keys
    const amounts = [10, 20, 30];
    const countPerAmount = 100;
    const allKeys: Array<{ key: string; amount: number }> = [];
    const generatedKeys = new Set<string>();

    // Generate unique keys in memory first
    for (const amount of amounts) {
      for (let i = 0; i < countPerAmount; i++) {
        let key: string;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 1000;

        // Generate unique key (check in-memory set)
        while (!isUnique && attempts < maxAttempts) {
          key = generateLicenseKey();
          if (!generatedKeys.has(key)) {
            isUnique = true;
            generatedKeys.add(key);
            allKeys.push({ key, amount });
          }
          attempts++;
        }

        if (!isUnique) {
          return NextResponse.json(
            { error: `Failed to generate unique key after ${maxAttempts} attempts` },
            { status: 500 }
          );
        }
      }
    }

    // Insert all keys in batches for better performance
    const batchSize = 50;
    const createdKeys: Array<{ key: string; amount: number }> = [];

    for (let i = 0; i < allKeys.length; i += batchSize) {
      const batch = allKeys.slice(i, i + batchSize);
      
      await prisma.licenseKey.createMany({
        data: batch.map(({ key, amount }) => ({
          key,
          amount,
          used: false,
        })),
        skipDuplicates: true, // Skip if key already exists
      });

      createdKeys.push(...batch);
    }

    // Count created keys by amount
    const summary = {
      10: createdKeys.filter((k) => k.amount === 10).length,
      20: createdKeys.filter((k) => k.amount === 20).length,
      30: createdKeys.filter((k) => k.amount === 30).length,
    };

    return NextResponse.json(
      {
        message: "License keys generated successfully",
        total: createdKeys.length,
        summary,
        keys: createdKeys, // Return all keys (you might want to remove this in production)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Generate license keys error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
