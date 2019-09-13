const newBudgetContainer = document.querySelector("#new-budget-container");
const budgetContainer = document.querySelector("#budget-container");

let expenseChart = document.querySelector("#expense-chart");
let user;
let budgets;
let subcategoryNames;
let subcategories = [];

// get subcategories and store in array
fetch("http://localhost:3000/subcategories")
    .then(res => res.json())
    .then(json => {
        json.data.forEach(function(obj) {
            subcategoryNames = obj.attributes.name;
            subcategories.push(subcategoryNames)
        })
    })

// let subcategoryChart = new Chart(expenseChart, {
//     type: 'doughnut',
//     data: {
//         labels: subcategories,
//         datasets: []
//     },
//     options: {}
// });



fetch("http://localhost:3000/users/1")
    .then(res => res.json())
    .then(json => {
        user = json;
        budgets = json.included;
        console.log(user);
        console.log(budgets);
        
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