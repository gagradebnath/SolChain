/**
 * Create Trading Table Migration
 * 
 * Creates table for P2P energy trading offers and transactions
 * 
 * Functions to implement:
 * - up(): Create trading table
 * - down(): Drop trading table
 * 
 * Table Schema:
 * - id: Primary key (auto-increment)
 * - seller_id: Seller user ID (foreign key)
 * - buyer_id: Buyer user ID (foreign key, nullable for pending offers)
 * - energy_amount: Energy amount in kWh
 * - price_per_kwh: Price per kWh in SolarTokens
 * - total_price: Total price in SolarTokens
 * - offer_type: Type (sell/buy)
 * - status: Trade status (pending/matched/completed/cancelled/disputed)
 * - priority: Trade priority (low/medium/high)
 * - expires_at: Offer expiration timestamp
 * - contract_address: Smart contract address
 * - transaction_hash: Blockchain transaction hash
 * - escrow_address: Escrow contract address
 * - dispute_status: Dispute status (none/initiated/resolved)
 * - dispute_reason: Reason for dispute
 * - completion_proof: Proof of energy delivery
 * - created_at: Offer creation timestamp
 * - matched_at: Trade matching timestamp
 * - completed_at: Trade completion timestamp
 * 
 * @author Team GreyDevs
 */

// TODO: Implement trading table migration
