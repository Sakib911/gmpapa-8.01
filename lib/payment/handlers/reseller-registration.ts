import { User } from '@/lib/models/user.model';
import { Store } from '@/lib/models/store.model';
import { generateUniqueSubdomain } from '@/lib/utils/domain';
import bcrypt from 'bcryptjs';
import { Reseller } from '@/lib/models/reseller.model';

export async function handleResellerRegistration(payment: any, transactionId: string, session: any) {
  try {
    const registrationData = payment.metadata.registrationData;
    console.log(registrationData)
    console.log(registrationData.domainSettings.type)
    if (!registrationData) {
      throw new Error('Registration data not found');
    }

    // Determine domain settings based on domain type
    let domainSettings: any = {};
    let storeURL: any;
    
    if (registrationData.domainSettings.type == 'subdomain') {
      console.log('I m subdomain')
      
      // For custom domain
      domainSettings = {
        subdomain: registrationData.subdomainPrefix || await generateUniqueSubdomain(registrationData.businessName),
        customDomain: '/',
        domainType:registrationData.domainType,
        customDomainVerified: false
        
      };
      storeURL = domainSettings.subdomain
    } else {
      console.log('i m custom domain')
      // For subdomain
      domainSettings = {
        customDomain: registrationData.domainSettings.customDomain,
        domainType:registrationData.domainType,
        customDomainVerified: false, // Requires verification
        subdomain: await generateUniqueSubdomain('store') // Fallback subdomain
      };
      storeURL = domainSettings.customDomain
    }

    

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

    // Create reseller document
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

    // Create store with domain settings
    const store = new Store({
      reseller: reseller._id,
      name: registrationData.storeName,
      storeURL,
      domainSettings,
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

    return user._id;
  } catch (error) {
    console.error('Error handling reseller registration:', error);
    throw error;
  }
}