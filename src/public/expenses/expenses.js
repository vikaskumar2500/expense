let expenseSize = 0;
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    window.location.href = "../signin/signin.html";
    return;
  }

  try {
    const isPremium = await checkPremiumStatus(token);
    togglePremiumFeatures(isPremium);

    const s3Data = await fetchS3Data(token);
    displayDownloadedFiles(s3Data);

    await getExpenses(1);
  } catch (e) {
    console.error(e.message);
  }
});

const checkPremiumStatus = async (token) => {
  try {
    const res = await axios.get("http://localhost:3000/premium/is-premium", {
      headers: { Authorization: token },
    });
    return res.data.isPremium;
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

const togglePremiumFeatures = (isPremium) => {
  const getPremiumButton = document.getElementById("rzp-button1");
  const premium = document.getElementById("premium");
  const downloadExpense = document.getElementById("downloadexpense");
  const downloadedFilesContainer = document.getElementById(
    "downloaded-files-container"
  );

  if (isPremium) {
    getPremiumButton.classList.add("hidden");
    premium.classList.remove("hidden");
    downloadExpense.classList.remove("hidden");
    downloadedFilesContainer.classList.remove("hidden");
  }
};

const fetchS3Data = async (token) => {
  try {
    const res = await axios.get("http://localhost:3000/expenses/s3", {
      headers: { Authorization: token },
    });
    return res.data.s3Data;
  } catch (e) {
    console.error(e.message);
    return [];
  }
};

const displayDownloadedFiles = (s3Data) => {
  const ol = document.getElementById("downloaded-files");
  ol.innerHTML = "";
  s3Data.forEach((file, index) => {
    const li = document.createElement("li");
    li.style = `
      display: flex; 
      width: 90%; 
      border-radius: 8px; 
      border: 1px solid #ddd; 
      padding: 10px; 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: #fff;
    `;
    li.innerHTML = `
      <div style="display:flex; align-items:start; width:100%; justify-content: space-between; padding:10px; gap:5px;">
        <span style="font-weight:300; font-size:18px">File${index + 1}</span>
        <span style="font-size:18px; font-weight:500;">${file.date
          ?.split("_")
          .join(" ")}</span>
        <a download href=${
          file.url
        } style="cursor:pointer" type='button'>Download Expenses</a>
      </div>
    `;
    ol.appendChild(li);
  });
};

const getExpenses = async (page) => {
  const token = localStorage.getItem("jwt_token");
  const limit = +localStorage.getItem("limit") || 10;

  const selectedLimit = document.getElementById(`limit${limit}`);

  if (!token) {
    window.location.href = "../signin/signin.html";
    return;
  }

  selectedLimit.setAttribute("selected", true);

  try {
    const res = await axios.get(
      `http://localhost:3000/expenses?limit=${limit}&page=${page}`,
      {
        headers: { Authorization: token },
      }
    );
    await getExpenseList(res.data.expenses);
    await showPagination(res.data.pagination);
  } catch (e) {
    console.error(e.message);
  }
};

const getExpenseList = async (expenses) => {
  expenseSize = expenses.length;
  const ul = document.getElementById("expense-list-container");

  ul.style = `
    display: flex; 
    flex-direction: column; 
    width: 80%; 
    align-items: start; 
    gap: 10px; 
    max-height: 25rem; 
    overflow-y:auto;
    list-style-type: none;
  `;
  ul.innerHTML = "";
  if (expenses.length === 0) {
    ul.innerHTML = `<span id="not-found" style="display:flex; text-align:center; width:90%; justify-content:center; padding:20px; font-size:18px; color:gray;">You have not added any expenses yet!</span>`;
    return;
  }

  expenses.forEach((expense) => ul.appendChild(addLiItem(expense)));
};

const addLiItem = ({ id, category, description, amount }) => {
  const li = document.createElement("li");
  li.id = `expense${id}`;
  li.style = `
    display: flex; 
    width: 90%; 
    border-radius: 8px; 
    border: 1px solid #ddd; 
    padding: 10px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  `;
  li.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
      <span style="font-size: 16px; font-weight: 500; flex: 1;">${amount} - ${category} - ${description}</span>
      <button id='delete' value=${id} onclick="deleteExpenses(event)" style="cursor: pointer; background: #ff4d4d; color: white; border: none; border-radius: 4px; padding: 6px 12px; margin-left: 10px;" type='button'>Delete</button>
    </div>
  `;
  return li;
};

const showPagination = async ({ next, prev, hasNext, hasPrev, last, curr }) => {
  const pagination = document.getElementById("pagination");
  pagination.style = `
    display:flex;
    align-items:center;
    justify-content:center;
    gap:5px;
  `;
  pagination.innerHTML = "";

  if (hasPrev) {
    const prevBtn = document.createElement("button");
    prevBtn.style = `
      padding:6px 8px;
    `;
    prevBtn.innerHTML = `<span>${prev}</span>`;
    prevBtn.addEventListener("click", () => getExpenses(prev));
    pagination.appendChild(prevBtn);
  }

  const currBtn = document.createElement("button");
  currBtn.style = "border:2px solid black; padding:10px; border-radius:5px";
  currBtn.innerHTML = `<span style="font-weight:600;border:2px">${curr} <span>`;
  currBtn.addEventListener("click", () => getExpenses(curr));
  pagination.appendChild(currBtn);

  if (hasNext && next <= last) {
    const nextBtn = document.createElement("button");
    nextBtn.style = `
      padding:6px 8px;
    `;
    nextBtn.innerHTML = `<span>${next}</span>`;
    nextBtn.addEventListener("click", () => getExpenses(next));
    pagination.appendChild(nextBtn);
  }
};

const dynamicPagination = async (e) => {
  e.preventDefault();
  localStorage.setItem("limit", e.target.value);

  await getExpenses(1);
};

const addExpense = async (e) => {
  e.preventDefault();
  const { amount, description, category } = e.target;
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    alert("Something went wrong, Please login again!");
    window.location.href = "../signin/signin.html";
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/expenses/add-expense", {
      amount: amount.value,
      description: description.value,
      category: category.value,
      token,
    });

    if (res.status !== 200) throw new Error(res.data.message);

    const notFound = document.getElementById("not-found");
    if (notFound) {
      notFound.remove();
    }

    const list = document.getElementById("expense-list-container");
    const li = addLiItem({
      id: res.data.expenseId,
      category: category?.value,
      description: description?.value,
      amount: amount?.value,
    });
    list.appendChild(li);
    ++expenseSize;

    // Clear the input fields after successful addition
    amount.value = "";
    description.value = "";

    if (document.getElementById("show-leaderboard").children.length > 0) {
      await showLeaderboard();
    }
  } catch (error) {
    console.error(error.message);
  }
};

const deleteExpenses = async (event) => {
  event.preventDefault();
  const id = event.target.value;
  const token = localStorage.getItem("jwt_token");

  try {
    const res = await axios.post(
      `http://localhost:3000/expenses/delete/${id}`,
      { token }
    );

    if (res.status !== 200) throw new Error("Something went wrong");

    const expense = document.getElementById(`expense${id}`);
    const leaderboard = document.getElementById("show-leaderboard");
    expense.remove();
    if (leaderboard.children.length > 0) {
      await showLeaderboard();
    }
    --expenseSize;

    const ul = document.getElementById("expense-list-container");
    if (expenseSize === 0) {
      ul.innerHTML = "";
      ul.style = `
        display: flex; 
        flex-direction: column; 
        width: 80%; 
        align-items: start; 
        gap: 10px; 
        max-height: 25rem; 
        overflow-y:auto;
        list-style-type: none;
      `;
      ul.innerHTML = `<span id="not-found" style="display:flex; width:90%; text-align:center; justify-content:center; padding:20px; font-size:18px; color:gray;">You have not added any expenses yet!</span>`;
    }
  } catch (e) {
    console.error(e.message);
  }
};

const download = async () => {
  const token = localStorage.getItem("jwt_token");

  try {
    const res = await axios.get("http://localhost:3000/expenses/download", {
      headers: { Authorization: token },
    });

    if (res.status !== 200)
      throw new Error("Something went wrong, try again later!");

    const link = document.createElement("a");
    link.href = res.data.url;
    link.setAttribute("download", "expenses-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error(e.message);
  }
};

const showLeaderboard = async () => {
  try {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      window.location.href = "../signin/signin.html";
      return;
    }

    const res = await axios.get(
      "http://localhost:3000/premium/show-leaderboard",
      {
        headers: { Authorization: token },
      }
    );

    const data = res.data;
    const leaderboard = document.getElementById("show-leaderboard");
    const leaderboardBtn = document.getElementById("leaderboard");
    leaderboard.innerHTML = "";

    if (data.length === 0) {
      leaderboard.innerHTML = `<span>No expenses added yet!</span>`;
      return;
    }

    leaderboardBtn.setAttribute("disabled", true);

    const h1 = document.createElement("h1");
    h1.textContent = "Leaderboard";
    const ul = document.createElement("ol");
    ul.id = "leaderboardList";
    ul.style = `
      display: flex; 
      flex-direction: column; 
      width: 60%; 
      gap: 10px; 
      max-height: 35rem; 
      overflow-y:auto;
      list-style-type: none;
    `;

    data.forEach((item) => {
      const li = document.createElement("li");
      li.id = `leaderboardItem${item.id}`;
      li.innerHTML = `
        <div style="display:flex; align-items:start; justify-content: space-between; padding:10px">
          <span style="font-size:16px; font-weight:500">Name: ${item.name} - Total expenses: ${item.total_expenses}</span>
        </div>
      `;
      ul.appendChild(li);
    });

    leaderboard.appendChild(h1);
    leaderboard.appendChild(ul);
  } catch (e) {
    console.error(e.message);
    const leaderboard = document.getElementById("show-leaderboard");
    leaderboard.innerHTML = `<span>Failed to load leaderboard. Please try again later.</span>`;
  }
};

document.getElementById("rzp-button1").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("jwt_token");
    const res = await axios.post("http://localhost:3000/expenses/orders", {
      amount: 2500,
      currency: "INR",
      token,
    });

    const data = res.data;

    const options = {
      key: data.keyId,
      name: "Expense Tracker",
      description: "Get Premium for better use!",
      order_id: data.orderId,
      handler: async (response) => {
        try {
          await axios.post("http://localhost:3000/expenses/payment-captured", {
            orderId: data.orderId,
            paymentId: response.razorpay_payment_id,
            token,
          });
          alert("You are now a premium user!");
        } catch (e) {
          console.error(e.message);
        }
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();

    rzp.on("payment.failed", async () => {
      try {
        await axios.post("http://localhost:3000/expenses/payment-failed", {
          orderId: data.orderId,
          token,
        });
      } catch (e) {
        console.error(e.message);
      }
    });
  } catch (e) {
    console.error(e.message);
  }
});
