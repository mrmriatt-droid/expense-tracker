
let expenseName=document.getElementById("expenseName");
let expenseAmount=document.getElementById("expenseAmount");
let addButton=document.getElementById("addButton");
let expenseList=document.getElementById("expenseList");
let total=document.getElementById("total");
let savedExpenses =localStorage.getItem("expenses");
let expenseCategory=document.getElementById("expenseCategory");
let filterCategory = document.getElementById("filterCategory");
let sortExpenses=document.getElementById("sortExpenses");
let searchExpense=document.getElementById("searchExpense");
let expenseCount =document.getElementById("expenseCount");
let categoryStats=document.getElementById("categoryStats");
let expenseDate =document.getElementById("expenseDate");
let filterPeriod =document.getElementById("filterPeriod");
let budgetAmount=document.getElementById("budgetAmount");
let saveBudget=document.getElementById("saveBudget");
let budgetDisplay=document.getElementById("budgetDisplay");
let remainingBudget=document.getElementById("remainingBudget");
let budgetAlert =document.getElementById("budgetAlert");
let expenseChart=document.getElementById("expenseChart");

let expenses = [];
let editingIndex = null;
let expenseChartInstance = Chart.getChart("expenseChart") || null;

//  التاريخ
let today = new Date();
let localDate  = today.getFullYear() + "-" +
String(today.getMonth()+1).padStart(2,"0") + "-" +
String(today.getDate()).padStart(2,"0");

expenseDate.value=localDate;



// دالة عرض مصروف
function displayExpenses(){
    expenseList.innerHTML = "";

     // دالة التصنيف بالنوع والفترة الزمنية والبحث 
let selectedCategory = filterCategory.value;
let searchText= searchExpense.value.toLowerCase();
let selectedPeriod  = filterPeriod.value;
  
let filteredExpenses = expenses
         
 .map(function(expense, index) { // نضيف لكل مصروف رقمه الأصلي عشان الحذف والتعديل يشتغلون صح بعد الفلترة
        return {
            expense: expense,
            index: index,
        };
    })

.filter(function(item) {
   let expense = item.expense;

let matchesCategory = selectedCategory === "All" || 
expense.category === selectedCategory;

let matchesSearch =
expense.name.toLowerCase().includes(searchText);

let matchesPeriod = true;

    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    let currentYearMonth = `${currentYear}-${currentMonth}`;

if (selectedPeriod === "today"){
matchesPeriod = expense.date === localDate;
}else if (selectedPeriod === "month"){
matchesPeriod = expense.date.startsWith(currentYearMonth);
}

return matchesCategory && matchesSearch && matchesPeriod;
});


expenseCount.textContent=`Showing ${filteredExpenses.length} expenses`;


//دالة حساب من الاصغر للاكبر او العكس
let selectedSort = sortExpenses.value;

if(selectedSort === "LowtoHigh"){
filteredExpenses.sort(function (a,b) {
    return a.expense.amount - b.expense.amount ;
});
}

else if(selectedSort === "HightoLow"){
filteredExpenses.sort(function (a,b) {
    return b.expense.amount - a.expense.amount ;
});
}else{
    filteredExpenses.sort(function (a,b) {
    return a.index - b.index ; 
    }); 
}



// ال display
    filteredExpenses.forEach(function(item){
        let expense = item.expense;
        let index = item.index;

         expenseList.innerHTML +=`
  <div class="expense-item">
                <p>
                    ${expense.name} - ${expense.amount} SAR - ${expense.category} - ${expense.date}

                    <button class="deleteButton" data-index="${index}">
                        Delete
                    </button>

                    <button class="editButton" data-index="${index}">
                        Edit
                    </button>
                </p>
 
                ${editingIndex === index ? `
                    <div class="editForm">
                        <input
                            type="text"
                            class="editName"
                            value="${expense.name}"
                            placeholder="Expense name"
                        >

                        <input
                            type="number"
                            class="editAmount"
                            value="${expense.amount}"
                            placeholder="Amount"
                        >

                        <select class="editCategory">
                            <option value="Food" ${expense.category === "Food" ? "selected" : ""}>Food</option>
                            <option value="Transport" ${expense.category === "Transport" ? "selected" : ""}>Transport</option>
                            <option value="Shopping" ${expense.category === "Shopping" ? "selected" : ""}>Shopping</option>
                            <option value="Other" ${expense.category === "Other" ? "selected" : ""}>Other</option>
                        </select>

                        <button class="saveEditButton" data-index="${index}">
                            Save Edit
                        </button>

                        <button class="cancelEditButton">
                            Cancel
                        </button>
                    </div>
                ` : ""}

            </div>
        `;
    });

}
  

//دالة حساب مجموع المبالغ
function calculateTotal(){

   let selectedCategory = filterCategory.value;
   let searchText= searchExpense.value.toLowerCase();
   let selectedPeriod  = filterPeriod.value;
   let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = String(today.getMonth() + 1).padStart(2, "0");
let currentYearMonth = `${currentYear}-${currentMonth}`;


     let filteredExpenses = expenses.filter(expense =>{

 let matchesCategory =
        selectedCategory === "All" ||
        expense.category === selectedCategory;

    let matchesSearch =
        expense.name.toLowerCase().includes(searchText);

    let matchesPeriod = true;

    if (selectedPeriod === "today") {
        matchesPeriod = expense.date === localDate;
    } else if (selectedPeriod === "month") {
        matchesPeriod = (expense.date || "").startsWith(currentYearMonth);
    }

    return matchesCategory && matchesSearch && matchesPeriod;
});

  let totalAmount = filteredExpenses.reduce((sum,expense) =>
 sum + expense.amount,0
);

total.textContent= `Total: ${totalAmount} SAR`;

//حساب اذا تعدى الميزانية 
/* Calculate monthly budget */
let monthlyExpenses = expenses.filter(expense =>
    (expense.date || "").startsWith(currentYearMonth)
);

let monthlyTotal = monthlyExpenses.reduce((sum, expense) =>
    sum + Number(expense.amount), 0
);

let savedBudget = localStorage.getItem("monthlyBudget");
let budget = Number(savedBudget);
let remaining = budget - monthlyTotal;

if (savedBudget !== null && savedBudget.trim() !== "" && budget > 0) {
    remainingBudget.textContent = remaining < 0
        ? `Over budget by ${Math.abs(remaining)} SAR`
        : `Remaining: ${remaining} SAR`;

    remainingBudget.style.color = remaining < 0 ? "red" : "green";

    budgetAlert.textContent = remaining < 0
        ? "You exceeded your budget!"
        : "";

    budgetAlert.style.color = "red";
} else {
    remainingBudget.textContent = "";
    budgetAlert.textContent = "";
}



if(remaining < 0 ){
budgetAlert.textContent="You exceeded your budget!";
budgetAlert.style.color=("red");
}else{
budgetAlert.textContent="";
budgetAlert.style.color=("green");
}

}


//دالة الاحصائيات
function displayCategoryStats(){
let categories = ["Food","Transport","Shopping","Other"];

categoryStats.innerHTML="";

     //حساب المحموع
let totalExpenses = expenses.reduce(function(sum,expense){
return sum + expense.amount;
},0);

    //فلترة وحساب كل تصنيف
categories.forEach(function(category){

    let categoryExpenses = expenses.filter(function(expense){
return expense.category === category;
    });

let categoryTotal =categoryExpenses.reduce(function(sum,expense){
return sum + expense.amount;
},0);

let percentage = totalExpenses > 0 ? (categoryTotal/totalExpenses)*100 : 0 ;

if( categoryTotal > 0){
categoryStats.innerHTML +=`<p>${category} : ${categoryTotal} SAR (${percentage.toFixed(1)}%)</p>`;
}

});
}


//التخزين : وقت الحفظ حولناه لنص 
function saveExpenses() {
    localStorage.setItem ("expenses" , JSON.stringify(expenses));
}

//  (البيانات اللي تظهر اول ما افتح الصفحة وبما فيها البيانات المخزنة) التخزين : وقت القراءة حولناه لأري 
if (savedExpenses){
expenses = JSON.parse(savedExpenses);
}

//استرجاع الميزانية المحفوظة
let savedBudget  = localStorage.getItem("monthlyBudget");

if(savedBudget !== null){
budgetDisplay.textContent=`Monthly Budget: ${savedBudget} SAR`;
budgetAmount.value=savedBudget;
}

displayExpenses();
calculateTotal();
displayCategoryStats();
displayChart();

//دالة اضافة مصروف
function addExpense() {

    let name = expenseName.value;
    let amount = expenseAmount.value;
    let category =expenseCategory.value;
    let date = expenseDate.value;

    if (name.trim() === ""){
     alert("Please enter an expense name.");
    return;
    }
    if(amount === ""){
        alert("Please enter an amount.");
        return;
    }

amount = Number(amount);

if (!Number.isFinite(amount) || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
}

if(amount > 10000){
 alert("Amount cannot exceed 10,000 SAR");
 return;
}
    //شرط اذا لقى مصروف زيه موجود ما يضيفه تاني
let existingExpense = expenses.find(function(expense){
return expense.name === name && 
expense.amount === amount &&
 expense.category === category;
});

if(existingExpense){
alert("This expense already exists.");
return;
}

expenses.push({
    name: name,
    amount: amount,
    category:category,
    date:date,
});

 saveExpenses();
displayExpenses();
calculateTotal();
displayCategoryStats();
displayChart();

expenseName.value = "";
expenseAmount.value = "";
expenseCategory.value = "Food";
expenseDate.value = localDate;

}


// دالة زر الاضافة
addButton.addEventListener("click",function(){
addExpense();
});

//اضافة من ضغطة enter على الكيبورد
expenseName.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addExpense();
    }
});

expenseAmount.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addExpense();
    }
}); 



// دالة حذف مصروف وتعديله
expenseList.addEventListener("click",function(event){

          //شرط الحذف
if (event.target.classList.contains("deleteButton")){

    let index = event.target.dataset.index;

let confirmDelete =confirm("Are you sure you want to delete this expense?");
if(confirmDelete){
expenses.splice(index,1);

    saveExpenses();
    displayExpenses();
    calculateTotal();
    displayCategoryStats();
    displayChart();
}

}

         //شرط زر التعديل 
if(event.target.classList.contains("editButton")){

    //يحدد المصروف الذي يظهر تحته نموذج التعديل
    editingIndex = Number(event.target.dataset.index);
    displayExpenses();
}

         //شرط زر حفظ التعديل
if (event.target.classList.contains("saveEditButton")) {

let index = Number(event.target.dataset.index);
let editForm = event.target.parentElement;

let newName = editForm.querySelector(".editName").value;
let newAmount = Number(editForm.querySelector(".editAmount").value);
let newCategory = editForm.querySelector(".editCategory").value;

if (newName.trim() === "") {
    alert("Please enter an expense name.");
    return;
}

if (!Number.isFinite(newAmount) || newAmount <= 0 || newAmount > 10000) {
    alert("Please enter a valid amount.");
    return;
}

  //شرط اذا لقى مصروف زيه موجود ما يعدل
let duplicateExpense = expenses.find(function(expense,i){
return expense.name === newName.trim() && 
expense.amount === newAmount &&
 expense.category === newCategory&&
i !== index;
});

if(duplicateExpense){
alert("This expense already exists.");
return;
}

expenses[index].name = newName.trim();
expenses[index].amount = newAmount;
expenses[index].category = newCategory;

editingIndex = null;

saveExpenses();
displayExpenses();
calculateTotal();
displayCategoryStats();
displayChart();
}

//شرط زر كنسلة التعديل 
if (event.target.classList.contains("cancelEditButton")) {
    editingIndex = null;
    displayExpenses();
}


});


// دالة مستمع التصنيفات 
filterCategory.addEventListener("change",function(){
displayExpenses();
calculateTotal();
});
// دالة مستمع ترتيب بالسعر
sortExpenses.addEventListener("change",function(){
displayExpenses();
});

// دالة مستمع خان البحث انه كل ما كتب تحدث
searchExpense.addEventListener("input",function(){
displayExpenses();
calculateTotal();

});

filterPeriod.addEventListener("change",function(){
displayExpenses();
calculateTotal();
});



saveBudget.addEventListener("click",function(){
let budget = Number(budgetAmount.value);

if(budget <= 0){
alert("Please enter a valid budget");
return;
}

localStorage.setItem("monthlyBudget",budget);

budgetDisplay.textContent=`Monthly Budget: ${budget} SAR`;

});

//دالة الchart 
function displayChart(){

let categoryTotals ={};

expenses.forEach(function(expense){

if(categoryTotals[expense.category]){
categoryTotals[expense.category] += expense.amount;
}else{
categoryTotals[expense.category] = expense.amount;
}

});

let labels = Object.keys(categoryTotals);
let values = Object.values(categoryTotals)


if(expenseChartInstance){
    //يحدث الرسم
expenseChartInstance.data.labels=labels;
expenseChartInstance.data.datasets[0].data=values;
expenseChartInstance.update();

}else{
    // الكود ينشئ الرسم
expenseChartInstance = new Chart (expenseChart,{ 
    type : "pie",
 data:{
    labels:labels,
 datasets:[{
    data: values,
    }]
},

options: {
responsive:true,
}

});

}


}