// const { values } = require('lodash');
// const content = require('./BotVariables/Banking Virtual Assistant/content.json');
const fs = require('fs');
const assistanceVar = require('./assistanceVariables.json');
const assistantVars = require('./assistanceVariables.json');
var variables = [
    "field_moneyMovement",
    "depositAcct",
    "ivr_crossQueryOption",
    "crossQueryOption",
    "allChoices",
    "payments",
    "billPayChoice",
    "billpayments",
    "crossQueryAllOption",
    "transferQuery",
    "depositAccountsTransfer",
    "billPay",
    "PtoP",
    "creditAccount",
    "External",
    "payBill",
    "makeP2p",
    "field_TF",
    "CA_CreditCard",
    "CA_DebitCard",
    "addBiller1",
    "AddPayee",
    "field_afford",
    "field_viewRCTransf",
    "field_addRCTransfer",
    "field_CnclRCTransfer",
    "field_UpdRCTransfer",
    "field_updSCTransfer",
    "field_CnclSCTransfer",
    "field_ViewSCTransfer",
    "field_viewTransfer",
    "field_addTransfer",
    "field_CnclTransfer",
    "field_updTransfer",
    "ivrOptionsRead",
    "seperator",
    "ivr_toAccMsg",
    "toAccMsg",
    "ivr_fromAccountMsg",
    "fromAccountMsg",
    "serviceFailureMsg",
    "loginerror",
    "noTransfers",
    "Amount",
    "FromAccount",
    "ToAccount",
    "Date",
    "CancelTransfer",
    "FixedOrVariableRT",
    "Frequency",
    "NextPaymentDate",
    "transferObjLabel",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "AccNotFound",
    "noAccFound_forRecTransfer",
    "genericTransfer",
    "modifyTransferAcc",
    "ivr_genericTransfer_list",
    "ivr_modifyTransferAcc_list",
    "scheduleOrRecurring_schedule",
    "scheduleOrRecurring_recurring",
    "ivr_ScheduleOrRecurring",
    "ivr_cancelScheduleOrRecurring",
    "UpdateScheduleOrRecurringloan",
    "cancelScheduleOrRecurringloan",
    "cancelScheduleOrRecurring"
]


var ana = {
    newVar: [],
    existed: []
}
// var allArrays = Object.keys(assistantVars);
var allArrays = assistantVars.map(value => value.VARIABLENAME);
variables.forEach(value =>
{
    if (allArrays.includes(value))
    {
        ana.existed.push(value)
    } else
    {
        ana.newVar.push(value)
    }
})
// console.log(ana);
// Contact Information


// 
// var contentVars = {
//     "IVR-NC-AUTH_USR-PII-DOB": content.btn_piiDOB ?? "Date of Birth",
//     "IVR-NC-AUTH_USR-PII-PWD": content.btn_piiPWD??"Password",
//     "IVR-NC-AUTH_USR-PII-LST_DEP": content.btn_piiLastDeposit ?? "Last Deposit",
//     "IVR-NC-AUTH_USR-PII-SSN": content.btn_piiSSN ??"SSN",
//     "IVR-NC-AUTH_USR-PII-ACC_NUM": content.btn_piiAccNum ?? "Account Number",
//     "IVR-NC-AUTH_USR-PII-MAID_NAM": content.btn_piiMaidName ??"Maid Name",
//     "IVR-NC-AUTH_USR-PII-MOB_ONL_ID": content.btn_piiMobOnlineId ?? "Online Mobile ID",
//     "IVR-NC-AUTH_USR-PII-ZIP": content.btn_piiZipcode??"ZIP/ Postal code",
//     "IVR-NC-AUTH_USR-PII-ADDR": content.btn_piiAddrNums??"All numbers in the first line of street address",
//     "IVR-NC-AUTH_USR-PII-LST_DBT_PUR": content.btn_piiLastDebitCardPur ?? "Last Debit Card Purchase|"
// }

var option = {
    "IVR-NC-AUTH_USR-PII-DOB": true,
    "IVR-NC-AUTH_USR-PII-PWD": true,
    "IVR-NC-AUTH_USR-PII-LST_DEP": true,
    "IVR-NC-AUTH_USR-PII-SSN": true,
    "IVR-NC-AUTH_USR-PII-ACC_NUM": true,
    "IVR-NC-AUTH_USR-PII-MAID_NAM": true,
    "IVR-NC-AUTH_USR-PII-MOB_ONL_ID": true,
    "IVR-NC-AUTH_USR-PII-ZIP": true,
    "IVR-NC-AUTH_USR-PII-ADDR": true,
    "IVR-NC-AUTH_USR-PII-LST_DBT_PUR": true
}

var contentVars = {
    "IVR-NC-AUTH_USR-PII-DOB": "Date of birth",
    "IVR-NC-AUTH_USR-PII-PWD": "password",
    "IVR-NC-AUTH_USR-PII-LST_DEP": "last deposit",
    "IVR-NC-AUTH_USR-PII-SSN": "ssn",
    "IVR-NC-AUTH_USR-PII-ACC_NUM": "Account numner",
    "IVR-NC-AUTH_USR-PII-ADDR": "Addr",
    "IVR-NC-AUTH_USR-PII-MAID_NAM": "maid name"
}

//   function preparePiiOptResponse(option) {
//     let response = [];
//     let enabledKeys = Object.keys(option).filter(key => option[key]);

//     for (let key of enabledKeys) {
//         response.push(contentVars[key]);
//     }

//     if (response.length === 0) {
//         return "";
//     } else if (response.length === 1) {
//         return response[0];
//     } else if (response.length === 2) {
//         return response.join(' and ');
//     } else {
//         let lastItem = response.pop();
//         return response.join(', ') + ' and ' + lastItem;
//     }
// }
function preparePiiOptResponse(option){
    const enabledKeys = Object.keys(option).filter(key => option[key]);
    const responseLength = enabledKeys.length;

    switch (responseLength)
    {
        case 0:
            return "";
        case 1:
            return contentVars[enabledKeys[0]];
        case 2:
            return `${contentVars[enabledKeys[0]]} and ${contentVars[enabledKeys[1]]}`;
        default:
            const lastItem = contentVars[enabledKeys[responseLength - 1]];
            const remainingItems = enabledKeys.slice(0, responseLength - 1).map(key => contentVars[key]);
            return `${remainingItems.join(', ')} and ${lastItem}`;
    }
}

var accountsObj = [{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Home Equity Line","accountNickname":"Equity Line","accountNumber":1045643,"accountType":"Home Equity Line","status":"active","currency":"USD","availableBalance":null,"currentBalance":42345.42,"minimumBalance":null,"creditLimit":75000,"statementDate":"","activatedDate":"","deactivatedDate":"","lastUpdated":"","image":"","availableCredit":32654.58,"unbilledAmount":32654.58,"dueAmount":null,"dueDate":"04/20/2024","cardNumber":null,"minimumPaymentDue":846.91,"rewardPoints":null,"expiryDate":"","availableCash":null,"personalBankerName":"","maxTransactionLimit":null,"userID":"a2278f1dc552b843","cardType":"","cardNetwork":"","cardName":"","P2PLimit":null,"CardStatus":"","routingNumber":212313414,"availableCashLimit":null,"principalBalance":null,"payoffAmount":400,"originalLoanAmount":null,"monthlyPayment":null,"loanOriginationDate":"","propertyAddress":"10976 Happy Ln., Mytown  FL,  32082","lastDrawDate":"09/22/2025","productName":"","productCode":"EL01","totalBalance":42345.42,"postedBalance":null,"loanMaturityDate":"","location":"161 River Marsh Dr, Ponte Vedra Beach, Florida, 32082","email":"","phone":null,"expDate":"","maturityDate":"","interestRate":null,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"","holdingType":"","openingDate":"02-19-2005","cardDetails":[],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"5e5ea19acdd21aa0"},{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Personal Loan","accountNickname":"Personal Loan","accountNumber":1045542,"accountType":"Personal Loan","status":"active","currency":"USD","availableBalance":null,"currentBalance":464.36,"minimumBalance":null,"creditLimit":null,"statementDate":"","activatedDate":"","deactivatedDate":"","lastUpdated":"","image":"","availableCredit":null,"unbilledAmount":null,"dueAmount":464.36,"dueDate":"04/20/2024","cardNumber":null,"minimumPaymentDue":null,"rewardPoints":null,"expiryDate":"","availableCash":null,"personalBankerName":"","maxTransactionLimit":null,"userID":"a2278f1dc552b843","cardType":"","cardNetwork":"","cardName":"","P2PLimit":null,"CardStatus":"","routingNumber":514260221,"availableCashLimit":null,"principalBalance":2267.78,"payoffAmount":2842.45,"originalLoanAmount":27678.89,"monthlyPayment":464.36,"loanOriginationDate":"09/14/2015","propertyAddress":"","lastDrawDate":"","productName":"","productCode":"PL01","totalBalance":null,"postedBalance":null,"loanMaturityDate":"08/14/2025","location":"1234 Main street, New York, 32819","email":"","phone":null,"expDate":"","maturityDate":"","interestRate":null,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"","holdingType":"","openingDate":"01-23-2005","cardDetails":[],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"323430330a2f58e1"},{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Line of Credit","accountNickname":"LOC","accountNumber":1047509,"accountType":"Line of Credit","status":"active","currency":"USD","availableBalance":null,"currentBalance":26295.42,"minimumBalance":null,"creditLimit":50000,"statementDate":"","activatedDate":"","deactivatedDate":"","lastUpdated":"","image":"","availableCredit":23409.58,"unbilledAmount":null,"dueAmount":null,"dueDate":"04/20/2024","cardNumber":null,"minimumPaymentDue":525.91,"rewardPoints":null,"expiryDate":"","availableCash":null,"personalBankerName":"","maxTransactionLimit":null,"userID":"a2278f1dc552b843","cardType":"","cardNetwork":"","cardName":"","P2PLimit":null,"CardStatus":"","routingNumber":221422142,"availableCashLimit":null,"principalBalance":null,"payoffAmount":4000,"originalLoanAmount":null,"monthlyPayment":null,"loanOriginationDate":"","propertyAddress":"","lastDrawDate":"09/22/2025","productName":"","productCode":"LC01","totalBalance":26295.42,"postedBalance":null,"loanMaturityDate":"","location":"325 South Orange Ave, Orlando,Florida, 2855","email":"","phone":null,"expDate":"","maturityDate":"","interestRate":5.09,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"","holdingType":"","openingDate":"04-23-2006","cardDetails":[],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"68550205203389b7"},{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Auto Loan","accountNickname":"Auto Loan","accountNumber":1042376,"accountType":"Auto Loan","status":"active","currency":"USD","availableBalance":null,"currentBalance":454.36,"minimumBalance":null,"creditLimit":null,"statementDate":"","activatedDate":"","deactivatedDate":"","lastUpdated":"","image":"","availableCredit":null,"unbilledAmount":null,"dueAmount":454.36,"dueDate":"04/20/2024","cardNumber":null,"minimumPaymentDue":null,"rewardPoints":null,"expiryDate":"","availableCash":null,"personalBankerName":"","maxTransactionLimit":null,"userID":"a2278f1dc552b843","cardType":"","cardNetwork":"","cardName":"","P2PLimit":null,"CardStatus":"","routingNumber":143121224,"availableCashLimit":null,"principalBalance":2567.78,"payoffAmount":2642.45,"originalLoanAmount":25678.89,"monthlyPayment":454.36,"loanOriginationDate":"09/14/2015","propertyAddress":"","lastDrawDate":"","productName":"","productCode":"AL01","totalBalance":null,"postedBalance":null,"loanMaturityDate":"08/14/2025","location":"1320 Park avenue, Orlando, Florida, 76656","email":"","phone":null,"expDate":"","maturityDate":"","interestRate":null,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"","holdingType":"","openingDate":"03-29-2005","cardDetails":[],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"df3895b7b37469e8"},{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Mortgage","accountNickname":"Primary Home","accountNumber":1045566,"accountType":"Mortgage","status":"active","currency":"USD","availableBalance":null,"currentBalance":null,"minimumBalance":null,"creditLimit":null,"statementDate":"","activatedDate":"","deactivatedDate":"","lastUpdated":"","image":"","availableCredit":null,"unbilledAmount":null,"dueAmount":2523.86,"dueDate":"04/20/2024","cardNumber":null,"minimumPaymentDue":null,"rewardPoints":null,"expiryDate":"","availableCash":null,"personalBankerName":"","maxTransactionLimit":null,"userID":"a2278f1dc552b843","cardType":"","cardNetwork":"","cardName":"","P2PLimit":null,"CardStatus":"","routingNumber":122213456,"availableCashLimit":null,"principalBalance":225789.78,"payoffAmount":227076.45,"originalLoanAmount":305678.89,"monthlyPayment":2523.86,"loanOriginationDate":"03/15/2010","propertyAddress":"1234 Main St., Anytown  MN,  55331","lastDrawDate":"","productName":"","productCode":"ML01","totalBalance":null,"postedBalance":null,"loanMaturityDate":"02/15/2040","location":"172 W Flagler Street, Miami, Florida, 33130, USA","email":"","phone":null,"expDate":"","maturityDate":"","interestRate":null,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"","holdingType":"","openingDate":"02-23-2004","cardDetails":[],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"46e598fe51c98a19"},{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Credit Card","accountNickname":"Rewards Card","accountNumber":1045302,"accountType":"Credit Card","status":"active","currency":"USD","availableBalance":8547.43,"currentBalance":null,"minimumBalance":null,"creditLimit":10000,"statementDate":"03/16/2024","activatedDate":"01-01-2010","deactivatedDate":"","lastUpdated":"01-08-2019","image":"","availableCredit":1452.57,"unbilledAmount":5698.17,"dueAmount":7500,"dueDate":"04/20/2024","cardNumber":1234456778906663,"minimumPaymentDue":300,"rewardPoints":123,"expiryDate":"01-01-2025","availableCash":200,"personalBankerName":"","maxTransactionLimit":null,"userID":"a2278f1dc552b843","cardType":"Primary","cardNetwork":"Visa","cardName":"American Express Platinum","P2PLimit":null,"CardStatus":"active","routingNumber":122235821,"availableCashLimit":10000,"principalBalance":null,"payoffAmount":null,"originalLoanAmount":null,"monthlyPayment":null,"loanOriginationDate":"","propertyAddress":"","lastDrawDate":"","productName":"","productCode":"CC05","totalBalance":13198.17,"postedBalance":null,"loanMaturityDate":"","location":"325 S Orange Ave, Orlando, Florida, 32801","email":"","phone":null,"expDate":"0125","maturityDate":"","interestRate":null,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","cardChannelInfo":{"ATM":{"enable":false,"limit":20000},"offline":{"enable":true,"limit":20000},"international":{"enable":false,"limit":100000},"online":{"enable":false,"limit":20000},"contactless":{"enable":true,"limit":20000}},"currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"","holdingType":"","openingDate":"01-23-2004","cardDetails":[{"cardName":"American-Express-Platinum-13-3R","cardNumber":"1234456778906663","cardStatus":"active","cardImage":"","cardType":"Primary","expDate":"0125","autopay":{},"cardChannelInfo":{"ATM":{"enable":false,"limit":20000},"offline":{"enable":true,"limit":20000},"international":{"enable":false,"limit":100000},"online":{"enable":false,"limit":20000},"contactless":{"enable":true,"limit":20000}},"cardRestrictions":{},"rewardPoints":"123","blockReason":"","nameOnCard":"","cardNetwork":"Visa","displayCardStatus":"Active","dueDate":"06/25/2021","minimumPaymentDue":"300","partialPaymentPaid":""}],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"a7a5e479f68d887c"},{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Checking Account","accountNickname":"Joint","accountNumber":1042347,"accountType":"Checking Account","status":"active","currency":"USD","availableBalance":6234.01,"currentBalance":null,"minimumBalance":1300,"creditLimit":null,"statementDate":"","activatedDate":"03-01-2010","deactivatedDate":"","lastUpdated":"01-08-2019","image":"","availableCredit":null,"unbilledAmount":null,"dueAmount":null,"dueDate":"","cardNumber":1234456778905553,"minimumPaymentDue":null,"rewardPoints":null,"expiryDate":"01-01-2027","availableCash":1000,"personalBankerName":"","maxTransactionLimit":400000,"userID":"a2278f1dc552b843","cardType":"Primary","cardNetwork":"","cardName":"","P2PLimit":7000,"CardStatus":"active","routingNumber":121122676,"availableCashLimit":1000,"principalBalance":null,"payoffAmount":null,"originalLoanAmount":null,"monthlyPayment":null,"loanOriginationDate":"","propertyAddress":"","lastDrawDate":"","productName":"","productCode":"CA04","totalBalance":null,"postedBalance":null,"loanMaturityDate":"","location":"161 River Marsh Dr, Ponte Vedra Beach, Florida, 32082","email":"","phone":null,"expDate":"0127","maturityDate":"","interestRate":null,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","cardChannelInfo":{"ATM":{"enable":false,"limit":20000},"offline":{"enable":true,"limit":20000},"international":{"enable":false,"limit":100000},"online":{"enable":false,"limit":20000},"contactless":{"enable":true,"limit":20000}},"currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"68143158","chequeBookDetails":{"enabled":false},"holdingType":"Single","openingDate":"04-23-2005","cardDetails":[{"cardName":"VISA-Platinum-66C","cardNumber":"1234456778905553","cardStatus":"active","cardImage":"","cardType":"Primary","expDate":"0127","autopay":{},"cardChannelInfo":{"ATM":{"enable":false,"limit":20000},"offline":{"enable":true,"limit":20000},"international":{"enable":false,"limit":100000},"online":{"enable":false,"limit":20000},"contactless":{"enable":true,"limit":20000}},"cardRestrictions":{},"rewardPoints":"","blockReason":"","nameOnCard":"","cardNetwork":"Discover","displayCardStatus":"Active","dueDate":"","minimumPaymentDue":"","partialPaymentPaid":""}],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"98fbcc419069391e"},{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Savings Account","accountNickname":"Vacation Fund","accountNumber":1043699,"accountType":"Savings Account","status":"active","currency":"USD","availableBalance":2256.93,"currentBalance":20,"minimumBalance":1500,"creditLimit":null,"statementDate":"","activatedDate":"01-01-2011","deactivatedDate":"","lastUpdated":"01-07-2019","image":"","availableCredit":null,"unbilledAmount":null,"dueAmount":null,"dueDate":"","cardNumber":null,"minimumPaymentDue":null,"rewardPoints":null,"expiryDate":"","availableCash":null,"personalBankerName":"","maxTransactionLimit":400000,"userID":"a2278f1dc552b843","cardType":"","cardNetwork":"Discover","cardName":"Getaway Card","P2PLimit":300,"CardStatus":"","routingNumber":null,"availableCashLimit":500,"principalBalance":null,"payoffAmount":null,"originalLoanAmount":null,"monthlyPayment":null,"loanOriginationDate":"","propertyAddress":"","lastDrawDate":"","productName":"","productCode":"SA05","totalBalance":null,"postedBalance":null,"loanMaturityDate":"","location":"1234 Main street, New York, 32819","email":"","phone":null,"expDate":"","maturityDate":"","interestRate":null,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"68143157","holdingType":"","openingDate":"03-20-2004","cardDetails":[{"cardName":"Getaway Card","cardNumber":"","cardStatus":"active","cardImage":"","cardType":"primary","expDate":"","autopay":{},"cardChannelInfo":{},"cardRestrictions":{},"rewardPoints":"","blockReason":"","nameOnCard":"","cardNetwork":"Discover","displayCardStatus":"Active","dueDate":"","minimumPaymentDue":"","partialPaymentPaid":""}],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"3312954a34198bff"},{"customerId":1045304,"nameOnAccount":"Bill","accountName":"Savings Account","accountNickname":"Joint with Son","accountNumber":1042224,"accountType":"Savings Account","status":"active","currency":"USD","availableBalance":5649.65,"currentBalance":20,"minimumBalance":1500,"creditLimit":null,"statementDate":"","activatedDate":"01-01-2011","deactivatedDate":"","lastUpdated":"01-07-2019","image":"","availableCredit":null,"unbilledAmount":null,"dueAmount":null,"dueDate":"","cardNumber":null,"minimumPaymentDue":null,"rewardPoints":null,"expiryDate":"","availableCash":null,"personalBankerName":"","maxTransactionLimit":400000,"userID":"a2278f1dc552b843","cardType":"","cardNetwork":"Discover","cardName":"Getaway Card","P2PLimit":450,"CardStatus":"","routingNumber":122105155,"availableCashLimit":1500,"principalBalance":null,"payoffAmount":null,"originalLoanAmount":null,"monthlyPayment":null,"loanOriginationDate":"","propertyAddress":"","lastDrawDate":"","productName":"","productCode":"SA04","totalBalance":null,"postedBalance":null,"loanMaturityDate":"","location":"2855 South Orange Ave, Orlando, Florida, 2855","email":"","phone":null,"expDate":"","maturityDate":"","interestRate":null,"valueAtMaturity":null,"earlyWithdrawalPenalty":null,"internalTransferFromEnabled":true,"internalTransferToEnabled":true,"p2pEnabled":true,"paybillEnabled":true,"swiftCode":"","branchName":"","bankName":"","openingBalance":null,"netWithdrawableBalance":null,"holdAmount":null,"unclearFundsAmount":null,"averageMonthlyBalance":null,"fdType":"","totalTenure":"","paidTenure":"","remainingTenure":"","debitAccountNumber":"","lateFee":null,"bounceCharge":null,"totalCharges":null,"overDueAmount":null,"lastEmiPaidOn":"","repaymentAccountNumber":null,"repaymentBankName":"","currentPeriodRewardPoints":null,"emiCount":null,"blockReason":"","freezeType":"","partialPaymentPaid":null,"iban":"68143156","holdingType":"","openingDate":"02-23-2003","cardDetails":[{"cardName":"Getaway Card","cardNumber":"","cardStatus":"active","cardImage":"","cardType":"primary","expDate":"","autopay":{},"cardChannelInfo":{},"cardRestrictions":{},"rewardPoints":"","blockReason":"","nameOnCard":"","cardNetwork":"Discover","displayCardStatus":"Active","dueDate":"","minimumPaymentDue":"","partialPaymentPaid":""}],"InterestDue":null,"isStatement":false,"isPrimaryMobileNumber":false,"isAlternateMobileNumber":false,"hasMissedEMI":false,"id":"8db7cf822b6459b3"}]

var mappedAccounts = [];

accountsObj.forEach(function(accountObj) {
    mappedAccount = {
        "accountName": accountObj.accountName,
        "accountType": accountObj.accountType,
        "accountNumber": accountObj.accountNumber.toString(),
        "MICR": "",
        "WarningCodes": []
    };
    mappedAccounts.push(mappedAccount);
});

// console.log(JSON.stringify(mappedAccounts));

var accs= [
    {
      "accountName": "Home Equity Line",
      "accountType": "Home Equity Line",
      "accountNumber": "1045643",
      "MICR": "",
      "WarningCodes": []
    },
    {
      "accountName": "Personal Loan",
      "accountType": "Personal Loan",
      "accountNumber": "1045542",
      "MICR": "",
      "WarningCodes": []
    },
    {
      "accountName": "Line of Credit",
      "accountType": "Line of Credit",
      "accountNumber": "1047509",
      "MICR": "",
      "WarningCodes": []
    },
    {
      "accountName": "Auto Loan",
      "accountType": "Auto Loan",
      "accountNumber": "1042376",
      "MICR": "",
      "WarningCodes": []
    },
    {
      "accountName": "Mortgage",
      "accountType": "Mortgage",
      "accountNumber": "1045566",
      "MICR": "",
      "WarningCodes": []
    },
    {
      "accountName": "Credit Card",
      "accountType": "Credit Card",
      "accountNumber": "1045302",
      "MICR": "",
      "WarningCodes": []
    },
    {
      "accountName": "Checking Account",
      "accountType": "Checking Account",
      "accountNumber": "1042347",
      "MICR": "",
      "WarningCodes": []
    },
    {
      "accountName": "Savings Account",
      "accountType": "Savings Account",
      "accountNumber": "1043699",
      "MICR": "",
      "WarningCodes": []
    },
    {
      "accountName": "Savings Account",
      "accountType": "Savings Account",
      "accountNumber": "1042224",
      "MICR": "",
      "WarningCodes": []
    }
  ];

  function checkAccountNumber(accounts, accountNumber) {
    // Check if the input or array is empty or undefined
    if (!accountNumber || !Array.isArray(accounts) || accounts.length === 0) {
        return false;
    }
    
    // Use Array.prototype.some() to check if the account number exists in the array
    return accounts.some(function(account) {
        return account.accountNumber === accountNumber;
    });
}

// console.log(checkAccountNumber(accs,"1043699"));

// console.log(preparePiiOptResponse(option));

var lastMsg = [
  "Here are your {{context.fLabel}}:\nJoint - XXX3401 - 121122676\nKids - XXX3881 - 121122676",
  "Here are your {{context.fLabel}}:\nJoint - XXX3401 - 121122676\nKids - XXX3881 - 121122676"
];

function convertAssistanceVar(){
  var assistanceVarrr = {};
  assistanceVar.forEach((value)=>{
    assistanceVarrr[value.VARIABLENAME] = value.BOTRESPONSE_en;
  })
  fs.writeFileSync("assitanceVar.json",JSON.stringify(assistanceVarrr));
  
}

// convertAssistanceVar();
function compareJSON(source, target) {
  var changes = {};
  var added = {};
  var deleted = {};
  var same = {};
  // Find keys that are common to both objects
  var keys = new Set([...Object.keys(source), ...Object.keys(target)]);
  for (var key of keys) {
      let sourceValue = source[key];
      let targetValue = target[key];
      if (sourceValue !== undefined && targetValue !== undefined) {
          // Key exists in both objects
          if (sourceValue !== targetValue) {
              // Values are different
              changes[key] = { oldValue: targetValue, newValue: sourceValue };
          } else {
              same[key] = sourceValue;
          }
      } else if (sourceValue !== undefined) {
          // Key exists only in source
          added[key] = sourceValue;
      } else {
          // Key exists only in target
          deleted[key] = targetValue;
      }
  }
  var Analytics = {
          "Total Source Count:":Object.keys(source).length,
          "Total Target Count:":Object.keys(target).length,
          "Same:":Object.keys(same).length,
          "Changed:":Object.keys(changes).length,
          "Deleted:":Object.keys(deleted).length,
          "Added:":Object.keys(added).length,
  }
  var data = { changes, added, deleted, same , Analytics};
  // convertJSONToSpreadsheet(data,Analytics);
  return data;
}
["itd_","rs","ns","flwup","ps"]
let source = fs.readFileSync("./content.json").toString();
let target = fs.readFileSync("./assitanceVar.json").toString();



fs.writeFileSync("assitanceDiff.json",JSON.stringify(compareJSON(JSON.parse(source),JSON.parse(target))));


// console.log(lastMsg.join(","));





