const IP = require("ip");
const moment = require("moment");

const STRIPE_KEY = process.env.STRIPE_KEY;

const stripe = require("stripe")(STRIPE_KEY);

const axios = require("axios");

const { dateTime } = require("./date_time");

// ---------------------------------------------------------  NEW

// create payment intent for user to user(card) to user(bank) with cutting stripe application fees
const createPaymentIntentUTU = async (data) => {
  try {
    var {
      fees,
      amount,
      account_id,
      // payment_method_id,
      customer_id,
      shipping_data,
    } = data;

    console.log("132456789:: ", data);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount * 100), // Amount in cents (e.g., $10.00) 1 dollor = 100 cent
      currency: "usd",
      customer: customer_id,
      application_fee_amount: parseInt(fees * 100), // Your fee in cents (e.g., 10% fee)
      // payment_method: payment_method_id, // ID of payment method
      transfer_data: {
        destination: account_id, // Receiver's Stripe account ID
      },
      description: "Payment for booking", // add
      metadata: {
        name: "test", // add req. metadata
      },
      shipping: {
        // add
        name: "abc",
        phone: 98787987987,
        address: {
          city: "NY",
          country: "US",
          state: "NY",
          line1: "test",
          postal_code: 121212,
        },
      },
    });

    console.log("paymentIntent id-->> ", paymentIntent.id);
    console.log("charge id-->> ", paymentIntent.latest_charge);
    console.log("charge id-->> ", paymentIntent);

    return paymentIntent;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// transfer payment from merchant account to xollaborate users in event collaboration
const transferPayment = async (data) => {
  try {
    var { amount, account_id, booking_id } = data;

    const transfer = await stripe.transfers.create({
      amount: parseInt(amount * 100), // Amount in cents (e.g., $10.00) 1 dollor = 100 cent,
      currency: "usd",
      destination: account_id,
      transfer_group: booking_id, // booking id - for identify the payment split in how many people
    });

    console.log("transfer id-->> ", transfer.id);

    return transfer.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// confirm payment intent for user to user(card) to user(bank) with cutting stripe application fees
const paymentIntentConfirm = async (data) => {
  try {
    let { payment_intent_id } = data;

    const paymentIntent = await stripe.paymentIntents.confirm(
      payment_intent_id,
      {
        payment_method: "pm_card_visa",
        return_url: "https://example.com/return_url",
      }
    );

    console.log("paymentIntent confirmation id-->> ", paymentIntent.id);
    console.log("paymentIntent charge  id-->> ", paymentIntent.latest_charge);
    console.log("paymentIntent data -->> ", paymentIntent);

    return paymentIntent;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

//Add paymentIntentCancel function by jignesh
const paymentIntentCancel = async (data) => {
  try {
    let { payment_intent_id } = data;

    const paymentIntent = await stripe.paymentIntents.cancel(payment_intent_id);

    console.log("paymentIntent cancellation id-->> ", paymentIntent.id);

    return paymentIntent.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// create payment method for payment method
const createPaymentMethod = async (data) => {
  try {
    var { card_number, exp_month, exp_year, cvc, user_id } = data;

    console.log({ data });

    let paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: card_number,
        exp_month: exp_month,
        exp_year: exp_year,
        cvc: cvc,
      },
      billing_details: { user_id: user_id },
    });

    return paymentMethod.id;
  } catch (error) {
    console.log("createToken:: ", error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// create payment intent for user to user(card) to user(bank) with cutting stripe application fees
const refundPaymentIntentUTU = async (data) => {
  try {
    let { charge_id, reversal_amount, refund_amount, transfer_id } = data;

    console.log("refundPaymentIntentUTU -->>> ", data);

    // reversal for take amount from provider account to merchant acount

    if (transfer_id) {
      var reversal = await stripe.transfers.createReversal(transfer_id, {
        amount: reversal_amount * 100, // Amount in cents (e.g., $10.00) 1 dollor = 100 cent
      });
    } else {
      var charge = await stripe.charges.retrieve(charge_id);

      var reversal = await stripe.transfers.createReversal(charge.transfer, {
        amount: reversal_amount * 100, // Amount in cents (e.g., $10.00) 1 dollor = 100 cent
      });
    }

    const refund = await stripe.refunds.create({
      charge: charge_id,
      amount: refund_amount * 100, // Amount in cents (e.g., $10.00) 1 dollor = 100 cent
      refund_application_fee: false,
    });

    let res_data = {
      reversal_id: reversal.id,
      refund_id: refund.id,
    };

    return res_data;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// give refund admin fees only to the user from admin panel
const refundPaymentIntentAdminFees = async (data) => {
  try {
    let { payment_intent_id, amount } = data;

    console.log("refundPaymentIntentAdminFees -->>> ", data);

    // reversal for take amount from provider account to merchant acount

    // var paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    // console.log({ paymentIntent });

    // // Now you can access the application fee amount associated with the Payment Intent
    // const applicationFeeAmount = paymentIntent.application_fee_amount;

    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      amount: amount * 100, // Amount in cents (e.g., $10.00) 1 dollor = 100 cent
      refund_application_fee: false,
    });

    return refund.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

const refundPaymentIntentPTU = async (data) => {
  try {
    let { payment_intent_id, original_payment_amount } = data;

    // Calculate the refund amount and the fee to retain
    const originalPaymentAmount = original_payment_amount; // $10.00 in cents
    console.log(originalPaymentAmount * 0.4 - originalPaymentAmount);

    var payment_percent = originalPaymentAmount - originalPaymentAmount * 0.04;
    const refundAmountToReceiver = Math.round(payment_percent); // $9.00 in cents

    const stripeFee = originalPaymentAmount - refundAmountToReceiver; // $1.00 in cents

    const paymentIntent = await stripe.refunds.create({
      payment_intent: payment_intent_id, // replace with the actual Payment Intent ID
      amount: refundAmountToReceiver,
      reverse_transfer: true, // reverses the transfer to the connected account
      refund_application_fee: false,
    });

    return paymentIntent.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

const refundModifyPayment = async (data) => {
  try {
    let { payment_intent_id, original_payment_amount } = data;

    const paymentIntent = await stripe.refunds.create({
      payment_intent: payment_intent_id, // replace with the actual Payment Intent ID
      amount: Math.round(original_payment_amount),
      reverse_transfer: true, // reverses the transfer to the connected account
      refund_application_fee: false,
    });

    return paymentIntent.id;
  } catch (error) {
    console.log("refundModifyPayment   error ---->>>", error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// ---------------------------------------------------------

// create customer in stripe
const createCustomer = async (data) => {
  try {
    var { user_id, email_address, user_name } = data;
    const currentDateTime = await dateTime();

    var customer = await stripe.customers.create({
      description: "Ad anima customer",
      email: email_address,
      // source: req.body.stripeToken,
      metadata: [{ user_id: user_id }],
      name: user_name,
    });

    return customer.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// update customer details in stripe
const updateCustomer = async (data) => {
  try {
    var { customer_id, user_name, balance, source } = data;

    var update_customer = await stripe.customers.update(customer_id, {
      // description: "Spot your next app test customer",
      // email: email_address,
      source: source,
      // balance: balance,
      name: user_name,
    });

    return update_customer.id;
    // return successRes(res, `Customer created successfully`, customer);
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// create token for charges or customer create and edit
const createToken = async (data) => {
  try {
    var { card_number, exp_month, exp_year, cvc } = data;

    console.log({ data });

    var token = await stripe.tokens.create({
      card: {
        number: card_number,
        exp_month: exp_month,
        exp_year: exp_year,
        cvc: cvc,
      },
    });

    return token.id;
  } catch (error) {
    console.log("createToken:: ", error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// create card in stripe
const createCard = async (data) => {
  try {
    var { customer_id, token } = data;

    const card = await stripe.customers.createSource(customer_id, {
      source: token,
    });

    return card.id;
  } catch (error) {
    console.log("createCard:: ", error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// create card as a default in customer
const makeCardDefault = async (data) => {
  try {
    var { customer_id, card_id } = data;

    console.log("132456789:: ", data);

    const makeDefaultCard = await stripe.customers.update(customer_id, {
      default_source: card_id,
    });

    return makeDefaultCard;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// charge api for create charge
const createCharge = async (data) => {
  try {
    var { amount, token, customer_id, user_id } = data;

    const charge = await stripe.charges.create({
      amount: amount * 100,
      // currency: "inr",
      currency: "usd",
      source: token,
      description: "Pet selling payment in spot your next pet",
      // customer: customer_id,
      metadata: {
        customer_id: customer_id,
        user_id: user_id,
      },
    });

    return charge.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// =============  Bank account ===============

// create bank account in stripe with connect (custom)
const createBankAccount = async (data) => {
  try {
    var {
      email_address,
      first_name,
      last_name,
      ssn_number,
      day,
      month,
      year,
      phone,
      city,
      line1,
      postal_code,
      state,
      account_holder_name,
      routing_no,
      account_number,
      company_name,
      tax_id,
    } = data;

    // console.log(data);

    // return;

    const currentDateTime = await dateTime();
    var dt = moment(currentDateTime).unix();

    // moment(currentDateTime).format('MMMM d, YYYY')

    const ipAddress = IP.address();

    const account = await stripe.accounts.create({
      type: "custom",
      country: "US",
      email: email_address,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        dob: { day: day, month: month, year: year },
        first_name: account_holder_name,
        last_name: " ",
        phone: phone,
        email: email_address,
        address: {
          city: city,
          line1: line1,
          postal_code: postal_code,
          state: state,
        },
        ssn_last_4: ssn_number.substr(ssn_number.length - 4),
        id_number: ssn_number,
      },
      metadata: {
        ac_no: account_number,
        s_no: ssn_number,
        tax_id: tax_id,
        phone: phone,
      },
      company: {
        name: company_name,
        tax_id: tax_id,
        // name: "adanima",
        // tax_id: "000000000",
      },
      business_profile: {
        mcc: 5969,
        // mcc: 7278,
        url: "http://yangx.sg-host.com/",
      },
      tos_acceptance: {
        date: dt,
        ip: ipAddress,
      },
      // external_account: {
      //   object: "bank_account",
      //   country: "US",
      //   currency: "USD",
      //   account_holder_name,
      //   routing_number: routing_no,
      //   account_number,
      // },
    });

    return account.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// create bank account in stripe with connect (custom) - for trinkess test
const createBankAccountTest = async (data) => {
  try {
    

    console.log("createBankAccountTest--->> ",data);

    // return;

    const currentDateTime = await dateTime();
    var dt = moment(currentDateTime).unix();

    // moment(currentDateTime).format('MMMM d, YYYY')

    const ipAddress = IP.address();

    const account = await stripe.accounts.create(data);

    return account;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// update bank account in stripe with connect (custom)
const updateBankAccount = async (data) => {
  try {
    var {
      email_address,
      first_name,
      last_name,
      ssn_number,
      day,
      month,
      year,
      phone,
      city,
      line1,
      postal_code,
      state,
      account_holder_name,
      routing_no,
      account_number,
      bank_account_id,
      company_name,
      tax_id,
    } = data;

    console.log("account_number++++++++++++++++++  ", account_number);

    const currentDateTime = await dateTime();
    var dt = moment(currentDateTime).unix();

    // moment(currentDateTime).format('MMMM d, YYYY')

    const ipAddress = IP.address();

    const update_account = await stripe.accounts.update(bank_account_id, {
      email: email_address,
      individual: {
        dob: { day: day, month: month, year: year },
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        email: email_address,
        address: {
          city: city,
          line1: line1,
          postal_code: postal_code,
          state: state,
        },
        ssn_last_4: ssn_number.substr(ssn_number.length - 4),
        id_number: ssn_number,
      },
      metadata: {
        ac_no: account_number,
        s_no: ssn_number,
        tax_id: tax_id,
        phone: phone,
      },
      company: {
        name: company_name,
        tax_id: tax_id,
        // name: "adanima",
        // tax_id: "000000000",
      },
      settings: {
        payouts: {
          debit_negative_balances: false,
          schedule: {
            delay_days: 2,
            interval: "daily",
          },
          statement_descriptor: null,
        },
      },
      // external_account: {
      //   object: "bank_account",
      //   country: "US",
      //   currency: "USD",
      //   account_holder_name,
      //   routing_number: routing_no,
      //   account_number,
      // },
      tos_acceptance: {
        date: dt,
        ip: ipAddress,
      },
    });

    return update_account.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// update bank account in stripe with connect (custom)
const getBankAccount = async (data) => {
  try {
    var { bank_account_id } = data;

    const account = await stripe.accounts.retrieve(bank_account_id);

    return account;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// create bank token for external aacount
const createBankToken = async (data) => {
  try {
    var { account_number, routing_number, account_holder_name } = data;

    console.log(
      "createBankToken //////////////////////////////",
      account_number
    );

    const token = await stripe.tokens.create({
      bank_account: {
        country: "US",
        currency: "usd",
        account_holder_name: account_holder_name,
        account_holder_type: "individual",
        routing_number: routing_number,
        account_number: account_number,
      },
    });

    return token.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// create external aacount
const createExternalAccount = async (data) => {
  try {
    var { bank_account_id, bank_account_token } = data;

    const bankAccount = await stripe.accounts.createExternalAccount(
      bank_account_id,
      {
        default_for_currency: true,
        external_account: bank_account_token,
      }
    );

    return bankAccount.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// update external aacount
const updateExternalAccount = async (data) => {
  try {
    // var { bank_account_id, external_account_id, bank_account_token } = data;

    // const bankAccount = await stripe.accounts.updateExternalAccount(
    //   bank_account_id,
    //   external_account_id,
    //   { routing_no: bank_account_token }
    // );

    var { account_holder_name, routing_no, account_number, bank_account_id } =
      data;

    const bankAccount = await stripe.accounts.update(bank_account_id, {
      external_account: {
        object: "bank_account",
        country: "US",
        currency: "USD",
        account_holder_name,
        routing_number: routing_no,
        account_number,
      },
    });

    return bankAccount.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// transfer money from merchant account to user bank aacount
const createTransfer = async (data) => {
  try {
    var { transfer_amount, bank_account_id } = data;

    const transfer = await stripe.transfers.create({
      amount: transfer_amount * 100,
      currency: "usd",
      destination: bank_account_id,
    });

    return transfer.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// transfer money from stripe connected account(user bank account) to merchant account
const createTransferUserToMerchant = async (data) => {
  try {
    var {
      transfer_amount,
      sender_bank_account_id,
      destination_bank_account_id,
    } = data;

    let transferData = {
      amount: transfer_amount * 100,
      currency: "usd",
      destination: destination_bank_account_id,
      // transfer_group :
    };

    const headers = {
      "Stripe-Account": sender_bank_account_id,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // Make the transfer API request

    let response = await axios.post(
      "https://api.stripe.com/v1/transfers",
      transferData,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_KEY}`,
          ...headers,
        },
      }
    );

    return response.data.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// ================== CASHAPP  =============================

// payment intent api for create payment intent
const createPaymentIntent = async (data) => {
  try {
    var { amount, customer_id } = data;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      payment_method_data: { type: "cashapp" },
      payment_method_types: ["cashapp"],
      customer: customer_id,
      description: "cashapp payment",
    });

    return paymentIntent.id;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// payment intent api for create payment intent
const createPaymentIntentLink = async (data) => {
  try {
    var { amount, customer_id } = data;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      // payment_method_data: { type: "link" },
      payment_method_types: ["link", "card"],
      // payment_method: "link",
      // customer: customer_id,
      description: "Card payment, Link payment",
      // automatic_payment_methods: {
      //   enabled: true,
      // },
    });

    return paymentIntent;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

const attchPaymentIntentLink = async (data) => {
  try {
    var { payment_intent_id } = data;

    console.log("==========", payment_intent_id);

    const paymentLink = await stripe.secret.create({
      payment_intent_data: {
        payment_intent: payment_intent_id,
      },
      line_items: [
        {
          // name: "Product Name",
          // description: "Product Description",
          price: 1000, // Amount in cents
          // currency: "usd",
          quantity: 1,
        },
      ],
    });
    // const paymentLink = await stripe.paymentLinks.create({
    //   payment_intent_data: {
    //     payment_intent: payment_intent_id,
    //   },
    //   line_items: [
    //     {
    //       // name: "Product Name",
    //       // description: "Product Description",
    //       price: 1000, // Amount in cents
    //       // currency: "usd",
    //       quantity: 1,
    //     },
    //   ],
    // });

    return paymentLink;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

const retrivePaymentIntentLink = async (data) => {
  try {
    var { payment_intent_id } = data;

    var paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    return paymentIntent;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// payment intent api for confirm payment intent
const confirmPaymentIntent = async (data) => {
  try {
    var { payment_intent_id } = data;

    const confirmPaymentIntent = await stripe.paymentIntents.confirm(
      payment_intent_id,
      { return_url: "https://www.example.com/checkout/done" }
    );

    return confirmPaymentIntent;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

// Check stripe merchent balance
const getBalance = async (data) => {
  try {
    var { payment_intent_id } = data;

    const get_balance = await stripe.paymentIntents.confirm(payment_intent_id, {
      return_url: "https://www.example.com/checkout/done",
    });

    return get_balance;
  } catch (error) {
    console.log(error);
    let err_res = {
      status: false,
      message: error.message,
    };
    return err_res;
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  createToken,
  createCard,
  makeCardDefault,
  createCharge,
  createBankAccount,
  updateBankAccount,
  getBankAccount,
  createBankToken,
  createExternalAccount,
  updateExternalAccount,
  createTransfer,
  createTransferUserToMerchant,
  createPaymentIntent,
  confirmPaymentIntent,
  createPaymentIntentUTU,
  createPaymentMethod,
  paymentIntentConfirm,
  paymentIntentCancel,
  refundPaymentIntentUTU,
  refundPaymentIntentPTU,
  refundModifyPayment,
  transferPayment,
  refundPaymentIntentAdminFees,
  createPaymentIntentLink,
  attchPaymentIntentLink,
  retrivePaymentIntentLink,
  createBankAccountTest,
};
