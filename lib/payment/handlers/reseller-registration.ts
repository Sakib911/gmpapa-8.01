import { User } from '@/lib/models/user.model';
import { Store } from '@/lib/models/store.model';
import { generateUniqueSubdomain } from '@/lib/utils/domain';
import bcrypt from 'bcryptjs';
import { Reseller } from '@/lib/models/reseller.model'; // Import the reseller model

export async function handleResellerRegistration(payment: any, transactionId: string, session: any) {
  try {
    const registrationData = payment.metadata.registrationData;
    if (!registrationData) {
      throw new Error('Registration data not found');
    }
    let subdomain;
   
    if(registrationData.domainType == 'custom'){
      subdomain = registrationData.customDomain
      registrationData.customDomainVerified = true;
    }
    else{
      subdomain = await generateUniqueSubdomain(registrationData.businessName);
    }
    
    // Generate unique subdomain from business name
    

    // Hash password
    const hashedPassword = await bcrypt.hash(registrationData.password, 12);

    // Create the user document
    const user = new User({
      email: registrationData.email,
      password: registrationData.password,
      name: registrationData.name,
      role: 'reseller',
      status: 'pending',
      wallet: {
        balance: 0,
        currency: 'BDT',
        transactions: []
      },
      statistics: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProfit: 0
      },
      preferences: {
        language: 'en',
        currency: 'BDT',
        notifications: {
          email: true,
          push: true,
          orderUpdates: true,
          promotions: true
        },
        theme: 'system'
      }
    });

    await user.save({ session });

    // Create reseller document in the `resellers` collection
    const reseller = new Reseller({
      userId: user._id,
      businessName: registrationData.businessName,
      businessDescription: registrationData.businessDescription || '',
      status: 'pending',
      registrationDate: new Date(),
      settings: {
        defaultMarkup: 20,
        minimumMarkup: 10,
        maximumMarkup: 50,
        autoFulfillment: true,
        lowBalanceAlert: 100
      },
      statistics: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProfit: 0
      }
    });

    await reseller.save({ session });

    // Create store with the generated subdomain
    const store = new Store({
      reseller: reseller._id, // Reference the reseller instead of the user directly
      name: registrationData.businessName,
      domainSettings: {
        subdomain,
        
      },
      customDomainVerified:registrationData.customDomainVerified,
      settings: {
        defaultMarkup: 20,
        minimumMarkup: 10,
        maximumMarkup: 50,
        autoFulfillment: true,
        lowBalanceAlert: 100
      },
      theme: {
        primaryColor: '#6366f1',
        accentColor: '#4f46e5',
        backgroundColor: '#000000'
      },
      status: 'pending',
      analytics: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProfit: 0
      }
    });

    await store.save({ session });

    // Update payment status
    payment.status = 'completed';
    payment.transactionId = transactionId;
    await payment.save({ session });

    return user._id; // You may also return the reseller ID if needed
  } catch (error) {
    console.error('Error handling reseller registration:', error);
    throw error;
  }
}
