document.addEventListener("DOMContentLoaded", () => {
    const userNameDisplay = document.getElementById("user-name");
    const balanceDisplay = document.getElementById("balance");
    const dollarBalanceDisplay = document.getElementById("dollar-balance");
    const logoutButton = document.getElementById("logout");
    const requestLoanButton = document.getElementById("request-loan");
    const requestCardButton = document.getElementById("request-card");
    const buyDollarsButton = document.getElementById("buy-dollars");

    let user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    if (!user.dollarBalance) {
        user.dollarBalance = 0;
    }

    userNameDisplay.textContent = user.username;
    balanceDisplay.textContent = user.balance.toFixed(2);
    dollarBalanceDisplay.textContent = user.dollarBalance.toFixed(2);

    function updateBalance() {
        balanceDisplay.textContent = user.balance.toFixed(2);
        dollarBalanceDisplay.textContent = user.dollarBalance.toFixed(2);
        let users = JSON.parse(localStorage.getItem("users"));
        let updatedUsers = users.map(u => (u.username === user.username ? user : u));
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    }

    
    buyDollarsButton.addEventListener("click", async () => {
        const exchangeRate = 1074.50; // 
        
        const { value: amount } = await Swal.fire({
            title: "Comprar Dólares",
            input: "number",
            inputLabel: `Tasa de cambio: 1 USD = ${exchangeRate} ARS`,
            inputValidator: (value) => {
                if (!value || value <= 0) return "Ingrese un monto válido";
            },
            showCancelButton: true
        });

        if (amount) {
            const totalCost = amount * exchangeRate;

            if (user.balance >= totalCost) {
                user.balance -= totalCost;
                user.dollarBalance += parseFloat(amount);
                updateBalance();
                Swal.fire("Compra Exitosa", `Has comprado ${amount} USD por ${totalCost.toFixed(2)} ARS.`, "success");
            } else {
                Swal.fire("Error", "Saldo insuficiente para esta compra.", "error");
            }
        }
    });

    
    requestCardButton.addEventListener("click", () => {
        if (user.balance > 0) {
            Swal.fire("Tarjeta Aprobada", "Tu tarjeta ha sido emitida con éxito.", "success");
        } else {
            Swal.fire({
                title: "Saldo insuficiente",
                text: "No tienes saldo suficiente para solicitar una tarjeta. ¿Quieres solicitar un préstamo?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Solicitar Préstamo"
            }).then((result) => {
                if (result.isConfirmed) {
                    requestLoan();
                }
            });
        }
    });

    
    requestLoanButton.addEventListener("click", requestLoan);

    function requestLoan() {
        Swal.fire({
            title: "Monto del préstamo",
            input: "number",
            inputLabel: "Ingrese el monto que desea solicitar en pesos",
            inputValidator: (value) => {
                if (!value || value <= 0) return "Ingrese un monto válido";
            },
            showCancelButton: true
        }).then((loanResult) => {
            if (loanResult.isConfirmed) {
                let loanAmount = parseFloat(loanResult.value);
                
                Swal.fire({
                    title: "Opciones de pago",
                    input: "radio",
                    inputOptions: {
                        "1": "1 cuota (3% interés)",
                        "6": "6 cuotas (6% interés)",
                        "12": "12 cuotas (12.% interés)"
                    },
                    inputValidator: (value) => {
                        if (!value) return "Seleccione una opción de pago";
                    },
                    showCancelButton: true
                }).then((paymentResult) => {
                    if (paymentResult.isConfirmed) {
                        let months = parseInt(paymentResult.value);
                        let interestRate = months === 1 ? 0.030 : months === 6 ? 0.060 : 0.120;
                        let totalPayment = loanAmount + (loanAmount * interestRate);

                        Swal.fire({
                            title: "Detalles del préstamo",
                            html: `
                                <p>Monto solicitado: $${loanAmount.toFixed(2)}</p>
                                <p>Interés (${(interestRate * 100).toFixed(1)}%): $${(loanAmount * interestRate).toFixed(2)}</p>
                                <p><strong>Total a pagar: $${totalPayment.toFixed(2)}</strong></p>
                                <p>Cuotas: ${months} meses</p>`,
                            showCancelButton: true,
                            confirmButtonText: "Aceptar préstamo"
                        }).then((finalResult) => {
                            if (finalResult.isConfirmed) {
                                user.balance += loanAmount;
                                user.loans.push({ amount: loanAmount, totalPayment, months });

                                updateBalance();
                                Swal.fire("Préstamo aprobado", "El dinero ha sido agregado a tu cuenta.", "success");
                            }
                        });
                    }
                });
            }
        });
    }

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });
});
