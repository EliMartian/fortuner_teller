var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
window.addEventListener('load', init);
var APIkey = "WJ2S8Y8BM204TYD6";
var totalPortfolioValue = 0;
var customSellDateBool = false;
var stockIteration = 0;
var moneyTracker = [];
var stockTracker = [];
var godCounter = 0;
function init() {
    document.getElementById('new_portfolio').addEventListener('click', buildNewPortfolio);
    document.getElementById('submission').addEventListener('click', function (el) {
        el.preventDefault();
        showStock();
    });
    document.getElementById('custom_sell_date').addEventListener('click', displayCustomSellDate);
    document.getElementById('add_stock').addEventListener('click', function (el) {
        el.preventDefault();
        addNewStockInput('ticker', 'Stock:');
        addNewStockInput('amount', 'Amount:');
        addNewStockInput('date', 'Date:');
    });
}
function buildNewPortfolio() {
    totalPortfolioValue = 0;
    var newPort = document.querySelector('.new_port');
    newPort.style['display'] = 'block';
    var newBtn = document.querySelector('#new_portfolio');
    newBtn.style['display'] = 'none';
    document.getElementById('custom_sell_date').style.display = 'block';
    document.getElementById('date_invested').textContent = 'Date:';
    var divArray = document.querySelectorAll(".stock_input");
    for (var i = 0; i < divArray.length; i++) {
        var curr = divArray[i];
        curr.style.display = "flex";
    }
    var add = document.getElementById("add_stock");
    add.style.display = "block";
    var sub = document.getElementById("submission");
    sub.style.display = "block";
    var innards = document.getElementById('portfolio_value');
    innards.innerHTML = "";
    var inputCleaner = document.querySelectorAll('input');
    for (var i = 0; i < inputCleaner.length; i++) {
        if (inputCleaner[i].value != "") {
            inputCleaner[i].value = "";
        }
    }
}
function displayCustomSellDate() {
    var sellDate = document.createElement('div');
    sellDate.classList.add('stock_input');
    var sellLabel = document.createElement('label');
    sellLabel.setAttribute('for', 'custom_sell_date');
    sellLabel.textContent = "Sell Date:";
    var sellInput = document.createElement('input');
    sellInput.classList.add('custom_date');
    sellInput.setAttribute('type', 'text');
    sellInput.setAttribute('placeholder', 'Enter date sold (ex: 2022-05-05)');
    sellInput.required = true;
    sellDate.appendChild(sellLabel);
    sellDate.appendChild(sellInput);
    document.getElementById('stocks_container').appendChild(sellDate);
    var buyStockText = document.getElementById("date_invested");
    buyStockText.textContent = "Date Invested:";
}
function addNewStockInput(value, displayedText) {
    var input = document.createElement('div');
    input.classList.add('stock_input');
    var inptLabel = document.createElement('label');
    inptLabel.htmlFor = value;
    inptLabel.textContent = displayedText;
    input.appendChild(inptLabel);
    var actualInput = document.createElement('input');
    actualInput.type = 'text';
    actualInput.classList.add(value);
    input.appendChild(actualInput);
    var stockContainer = document.getElementById('stocks_container');
    stockContainer.appendChild(input);
}
function showStock() {
    var symbols = document.querySelectorAll(".ticker");
    for (var i = 0; i < symbols.length; i++) {
        var inputElement = symbols[i];
        stockTracker[i] = inputElement.value;
    }
    stockIteration = symbols.length - 1;
    for (var i = stockIteration; i >= 0; i--) {
        var inputElement = symbols[i];
        var symbol = inputElement.value;
        var URL_1 = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=" + symbol + "&apikey=" + APIkey;
        fetch(URL_1)
            .then(statusCheck)
            .then(function (res) { return res.json(); })
            .then(calculateStock)
            .catch(handleErr);
    }
}
function calculateStock(response) {
    console.log("res");
    console.log(response);
    if (document.getElementById('stocks_container').childElementCount === 4) {
        console.log("inside the right if/else cond");
        var updatedInfo = response['Weekly Adjusted Time Series'];
        customSellDateBool = true;
        var userInvestedDateValue = document.getElementById("date_invested_field").value;
        var userInvestedDate = userInvestedDateValue.split("-");
        var userInvestedYear = userInvestedDate[0];
        var userInvestedMonth = userInvestedDate[1];
        var userInvestedDay = userInvestedDate[2];
        var indexDateInvested = findEntry(userInvestedYear, userInvestedMonth, userInvestedDay, response);
        console.log(indexDateInvested);
        var customSellDate = document.querySelector('.custom_date').value;
        var sellDateArray = customSellDate.split("-");
        var customSellYear = sellDateArray[0];
        var customSellMonth = sellDateArray[1];
        var customSellDay = sellDateArray[2];
        var indexDateSold = findEntry(customSellYear, customSellMonth, customSellDay, response);
        console.log("past index date sold");
        var adjClose = updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close'];
        var amounts = document.querySelectorAll('.amount');
        var startMoney = amounts[stockIteration].value;
        var symbols = document.querySelectorAll('.ticker');
        var symbol = symbols[stockIteration].value;
        var marketPrice = updatedInfo[Object.keys(updatedInfo)[indexDateSold]]['5. adjusted close'];
        var investmentValue = ((parseFloat(startMoney) / parseFloat(adjClose)) * parseFloat(marketPrice));
        totalPortfolioValue += investmentValue;
        stockTracker[godCounter] = response['Meta Data']['2. Symbol'];
        moneyTracker[godCounter] = investmentValue;
        godCounter++;
        // investmentValue = investmentValue.toFixed(2);
        // console.log(investmentValue);
        stockIteration = stockIteration - 1;
        if (stockIteration === -1) {
            var divArray = document.querySelectorAll(".stock_input");
            var totalP = document.createElement('p');
            var finalPortValue = totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            totalP.textContent = "Your investment would be worth roughly: $" + finalPortValue + " in today's market...";
            for (var i = 0; i < divArray.length; i++) {
                var curr = divArray[i];
                curr.style.display = "none";
            }
            document.getElementById('portfolio_value').appendChild(totalP);
            var newSymbols = document.querySelectorAll('.ticker');
            for (var i = 0; i < stockTracker.length; i++) {
                var newStockInfo = document.createElement('p');
                var pArray = document.querySelectorAll('.removable');
                for (var i_1 = 0; i_1 < pArray.length; i_1++) {
                    pArray[i_1].classList.add("remove");
                }
                newStockInfo.classList.add('removable');
                newStockInfo.textContent = "Your investment in " + stockTracker[i] +
                    " would be worth  roughly $" + moneyTracker[i].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.getElementById('portfolio_value').appendChild(newStockInfo);
            }
            var newBtn = document.querySelector('#new_portfolio');
            newBtn.style.display = 'block';
            document.getElementById('add_stock').style.display = "none";
            document.getElementById('submission').style.display = "none";
            document.getElementById('custom_sell_date').style.display = "none";
        }
    }
    else {
        console.log("inside of the regular no custom sell date option branch");
        var updatedInfo = response['Weekly Adjusted Time Series'];
        console.log("updated info");
        console.log(updatedInfo);
        var userInvestedDateValue = document.getElementById("date_invested_field").value;
        // console.log("here's the user's invested date");
        // console.log(userInvestedDate);
        var userInvestedDate = userInvestedDateValue.split("-");
        var userInvestedYear = userInvestedDate[0];
        var userInvestedMonth = userInvestedDate[1];
        var userInvestedDay = userInvestedDate[2];
        console.log("After userInvestedDate Split");
        var indexDateInvested = findEntry(userInvestedYear, userInvestedMonth, userInvestedDay, response);
        console.log("After findEntry");
        var userAdjCloseInvested = updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close'];
        console.log(updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]);
        console.log(updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close']);
        var amounts = document.querySelectorAll('.amount');
        var startMoney = amounts[stockIteration].value;
        var symbols = document.querySelectorAll('.ticker');
        var symbol = symbols[stockIteration].value;
        var marketPrice = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
        console.log("Market Price: ");
        console.log(marketPrice);
        var investmentValue = ((parseFloat(startMoney) / parseFloat(userAdjCloseInvested)) * parseFloat(marketPrice));
        totalPortfolioValue += investmentValue;
        stockTracker[godCounter] = response['Meta Data']['2. Symbol'];
        moneyTracker[godCounter] = investmentValue;
        godCounter++;
        // investmentValue = investmentValue.toFixed(2);
        stockIteration = stockIteration - 1;
        if (stockIteration === -1) {
            var divArray = document.querySelectorAll(".stock_input");
            var totalP = document.createElement('p');
            var finalPortValue = totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            totalP.textContent = "Your investment would be worth roughly: $" + finalPortValue + " in today's market...";
            for (var i = 0; i < divArray.length; i++) {
                var curr = divArray[i];
                curr.style.display = "none";
            }
            document.getElementById('portfolio_value').appendChild(totalP);
            var newSymbols = document.querySelectorAll('.ticker');
            for (var i = 0; i < stockTracker.length; i++) {
                var newStockInfo = document.createElement('p');
                var pArray = document.querySelectorAll('.removable');
                for (var j = 0; j < pArray.length; j++) {
                    pArray[j].classList.add("remove");
                }
                newStockInfo.classList.add('removable');
                newStockInfo.textContent = "Your investment in " + stockTracker[i] +
                    " would be worth roughly $" + moneyTracker[i].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.getElementById('portfolio_value').appendChild(newStockInfo);
            }
            var newBtn = document.querySelector('#new_portfolio');
            newBtn.style['display'] = 'block';
            document.getElementById('add_stock').style.display = "none";
            document.getElementById('submission').style.display = "none";
            document.getElementById('custom_sell_date').style.display = "none";
        }
    }
}
// Checks the status of the response
function statusCheck(res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!res.ok) return [3 /*break*/, 2];
                    _a = Error.bind;
                    return [4 /*yield*/, res.text()];
                case 1: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                case 2: return [2 /*return*/, res];
            }
        });
    });
}
// Finds the closest entry in the API week list based upon 
// a provided year, month, and date. Returns the index of the week which 
// is closest to the provided year, month and day input. 
function findEntry(year, month, day, response) {
    var updatedInfo = response['Weekly Adjusted Time Series'];
    var length = Object.keys(updatedInfo).length;
    var minIndex = 0;
    var min = 100000;
    var validData = false; // NOTE: UPDATE THIS TO INCLUDE IF THEY GO TOO EARLY LATER
    for (var i = 0; i < length; i++) {
        var tuple = Object.keys(updatedInfo)[i];
        var tupleData = tuple.split('-');
        if (tupleData[0] == year) {
            if (tupleData[1] == month) {
                if (tupleData[2] >= day || (day > tupleData[2] && (Math.abs(parseInt(tupleData[2]) - parseInt(day)) <= 7))) {
                    var temp = Math.abs((parseInt(tupleData[2]) / 7) - (parseInt(day) / 7));
                    if (temp < min) {
                        min = temp;
                        minIndex = i;
                    }
                }
            }
        }
    }
    // Return the minimum difference index between the date the user provided and the closest match in the weekly series
    return minIndex;
}
function handleErr() {
    console.log("there was an error, ruh roh!");
}
