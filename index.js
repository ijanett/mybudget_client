const newBudgetContainer = document.querySelector("#new-budget-container");
const budgetContainer = document.querySelector("#budget-container");
const subcategoryDropdown = document.getElementById("subcategory-dropdown");
const incomeInputDescription = document.getElementById("income-description");
const incomeInputAmount = document.getElementById("income-amount");
const incomeSubmitBtn = document.querySelector("#income-submit-button");
const incomeList = document.getElementById("income-list")
const expenseInputDescription = document.getElementById("expense-description");
const expenseInputAmount = document.getElementById("expense-amount")
const expenseSubmitBtn = document.querySelector("#expense-submit-button");
let expenseChart = document.getElementById("expense-chart").getContext("2d");
let user;
let budgets;
let income;
let expense;
let subcategoryNames;
let subcategories = [];


function renderIncome(objArray) {
    objArray.forEach(obj => {
        incomeList.innerHTML += `
            <li>${obj.attributes.description} $${obj.attributes.amount}</li>
        `
    })
}

// expense form submit
expenseSubmitBtn.addEventListener('click', function(e) {
    e.preventDefault();
})

// get subcategories and add to dropdown option values
// store in array
fetch("http://localhost:3000/subcategories")
    .then(res => res.json())
    .then(json => {
        json.data.forEach(function(obj) {
            subcategoryDropdown.innerHTML += `
            <option value="${obj.id}">${obj.attributes.name}</option>
            `
            subcategoryNames = obj.attributes.name;
            subcategories.push(subcategoryNames);
        })
    })

fetch("http://localhost:3000/users/1")
    .then(res => res.json())
    .then(json => {
        user = json;
        budgets = json.included;
        console.log(user);
        income = budgets.filter(budget => {
            return budget.attributes.category === "income"
        })
        console.log(income)
        renderIncome(income);
        
        // budgetContainer.innerHTML += `
        // <h3>${user.data.attributes.username}</h3>
        // `

    });

// function renderUsers(json) {
//     Object.keys(json).forEach(function(key) {
//         const userObjs = json[key];
//         userObjs.forEach(user => {
//             userContainer.innerHTML += `
//             <h3>${user.attributes.username}</h3>
//             `
//         })
//     })
// }