import { AffiliateProduct } from '../types';

interface Commission {
  productId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: Date;
  paidAt?: Date;
}

interface CommissionSummary {
  totalPending: number;
  totalApproved: number;
  totalPaid: number;
  recentCommissions: Commission[];
}

interface CommissionThreshold {
  amount: number;
  bonusPercentage: number;
}

const COMMISSION_THRESHOLDS: CommissionThreshold[] = [
  { amount: 1000, bonusPercentage: 2 },
  { amount: 5000, bonusPercentage: 5 },
  { amount: 10000, bonusPercentage: 10 }
];

export class CommissionTracker {
  private commissions: Commission[] = [];

  async trackNewSale(
    product: AffiliateProduct,
    orderId: string,
    saleAmount: number
  ): Promise<Commission> {
    const baseCommission = saleAmount * (product.commissionRate / 100);
    const bonusPercentage = this.calculateBonusPercentage();
    const totalCommission = baseCommission * (1 + bonusPercentage / 100);

    const commission: Commission = {
      productId: product.id,
      orderId,
      amount: totalCommission,
      status: 'pending',
      createdAt: new Date()
    };

    this.commissions.push(commission);
    await this.saveCommission(commission);

    return commission;
  }

  private calculateBonusPercentage(): number {
    const monthlyTotal = this.calculateMonthlyTotal();
    const threshold = COMMISSION_THRESHOLDS
      .reverse()
      .find(t => monthlyTotal >= t.amount);

    return threshold?.bonusPercentage || 0;
  }

  private calculateMonthlyTotal(): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.commissions
      .filter(c => c.createdAt >= monthStart)
      .reduce((sum, c) => sum + c.amount, 0);
  }

  async getCommissionSummary(): Promise<CommissionSummary> {
    const pendingCommissions = this.commissions.filter(c => c.status === 'pending');
    const approvedCommissions = this.commissions.filter(c => c.status === 'approved');
    const paidCommissions = this.commissions.filter(c => c.status === 'paid');

    return {
      totalPending: pendingCommissions.reduce((sum, c) => sum + c.amount, 0),
      totalApproved: approvedCommissions.reduce((sum, c) => sum + c.amount, 0),
      totalPaid: paidCommissions.reduce((sum, c) => sum + c.amount, 0),
      recentCommissions: this.commissions
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
    };
  }

  async approveCommission(orderId: string): Promise<void> {
    const commission = this.commissions.find(c => c.orderId === orderId);
    if (commission && commission.status === 'pending') {
      commission.status = 'approved';
      await this.saveCommission(commission);
    }
  }

  async markCommissionAsPaid(orderId: string): Promise<void> {
    const commission = this.commissions.find(c => c.orderId === orderId);
    if (commission && commission.status === 'approved') {
      commission.status = 'paid';
      commission.paidAt = new Date();
      await this.saveCommission(commission);
    }
  }

  private async saveCommission(commission: Commission): Promise<void> {
    // In a real implementation, this would save to a database
    console.log('Saving commission:', commission);
  }

  async getProductCommissions(productId: string): Promise<Commission[]> {
    return this.commissions.filter(c => c.productId === productId);
  }

  async getMonthlyReport(): Promise<{
    totalEarnings: number;
    bonusEarnings: number;
    commissionsCount: number;
    averageCommission: number;
  }> {
    const monthlyCommissions = this.commissions.filter(c => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return c.createdAt >= monthStart;
    });

    const totalEarnings = monthlyCommissions.reduce((sum, c) => sum + c.amount, 0);
    const commissionsCount = monthlyCommissions.length;

    return {
      totalEarnings,
      bonusEarnings: totalEarnings * (this.calculateBonusPercentage() / 100),
      commissionsCount,
      averageCommission: commissionsCount > 0 ? totalEarnings / commissionsCount : 0
    };
  }
}