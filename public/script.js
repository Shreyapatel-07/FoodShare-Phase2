
document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("donationForm");
    var message = document.getElementById("donationMessage");
    var list = document.getElementById("donationList");

    // Display a message to the user
    function showMessage(text, success) {
        message.textContent = text;
        message.classList.remove(
            "d-none",
            "alert-success",
            "alert-danger"
        );

        message.classList.add(
            success ? "alert-success" : "alert-danger"
        );
    }

    // Create a paragraph safely
    function createDetail(iconClass, label, value) {
        var paragraph = document.createElement("p");
        var icon = document.createElement("i");
        var text = document.createElement("span");

        icon.className = iconClass;
        text.textContent = label + ": " + (value || "Not provided");

        paragraph.appendChild(icon);
        paragraph.appendChild(text);

        return paragraph;
    }

    // Load donations from the backend
    function loadDonations() {
        fetch("/api/donations")
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Could not load donations.");
                }

                return response.json();
            })
            .then(function (data) {
                var donations = Array.isArray(data)
                    ? data
                    : (data.donations || []);

                list.innerHTML = "";

                if (donations.length === 0) {
                    var emptyColumn = document.createElement("div");
                    emptyColumn.className = "col-12";

                    var emptyBox = document.createElement("div");
                    emptyBox.className = "empty-donations";

                    var emptyIcon = document.createElement("i");
                    emptyIcon.className = "fa-solid fa-bowl-food";

                    var emptyHeading = document.createElement("h4");
                    emptyHeading.textContent = "No Donations Available Yet";

                    var emptyText = document.createElement("p");
                    emptyText.textContent =
                        "Be the first to share surplus food with your community.";

                    emptyBox.appendChild(emptyIcon);
                    emptyBox.appendChild(emptyHeading);
                    emptyBox.appendChild(emptyText);
                    emptyColumn.appendChild(emptyBox);
                    list.appendChild(emptyColumn);

                    return;
                }

                donations.forEach(function (donation) {
                    var column = document.createElement("div");
                    column.className = "col-md-6 col-lg-4";

                    var card = document.createElement("div");
                    card.className = "donation-card";

                    var foodIcon = document.createElement("div");
                    foodIcon.className = "food-icon";
                    foodIcon.innerHTML =
                        '<i class="fa-solid fa-bowl-food"></i>';

                    var heading = document.createElement("h4");
                    heading.textContent =
                        donation.foodType || "Food Donation";

                    card.appendChild(foodIcon);
                    card.appendChild(heading);

                    card.appendChild(createDetail(
                        "fa-solid fa-user",
                        "Donor",
                        donation.donorName
                    ));

                    card.appendChild(createDetail(
                        "fa-solid fa-box",
                        "Quantity",
                        donation.quantity
                    ));

                    card.appendChild(createDetail(
                        "fa-solid fa-location-dot",
                        "Location",
                        donation.location
                    ));

                    card.appendChild(createDetail(
                        "fa-solid fa-phone",
                        "Contact",
                        donation.phone
                    ));

                    if (donation.additionalInfo) {
                        card.appendChild(createDetail(
                            "fa-solid fa-circle-info",
                            "Additional information",
                            donation.additionalInfo
                        ));
                    }

                    var status = document.createElement("div");
                    status.className = "donation-status";
                    status.textContent =
                        donation.status || "Available";

                    card.appendChild(status);

                    var deleteButton = document.createElement("button");
                    deleteButton.type = "button";
                    deleteButton.className =
                        "btn btn-outline-danger btn-sm mt-3";
                    deleteButton.innerHTML =
                        '<i class="fa-solid fa-trash"></i> Delete';

                    deleteButton.addEventListener("click", function () {
                        deleteDonation(donation.id);
                    });

                    card.appendChild(deleteButton);
                    column.appendChild(card);
                    list.appendChild(column);
                });
            })
            .catch(function (error) {
                list.innerHTML = "";

                var errorColumn = document.createElement("div");
                errorColumn.className = "col-12";

                var errorText = document.createElement("p");
                errorText.className = "alert alert-danger";
                errorText.textContent =
                    "Unable to load donations. Please check the server.";

                errorColumn.appendChild(errorText);
                list.appendChild(errorColumn);

                console.error(error);
            });
    }

    // Submit a new donation
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var donation = {
            donorName: document.getElementById("donorName").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            foodType: document.getElementById("foodType").value,
            quantity: document.getElementById("quantity").value.trim(),
            location: document.getElementById("location").value.trim(),
            additionalInfo:
                document.getElementById("additionalInfo").value.trim()
        };

        showMessage("Saving your donation...", true);

        fetch("/api/donations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(donation)
        })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(
                        data.message || "Could not save donation."
                    );
                }

                return data;
            });
        })
        .then(function () {
            showMessage(
                "Thank you! Your donation has been saved successfully.",
                true
            );

            form.reset();
            loadDonations();

            document.getElementById("available-donations")
                .scrollIntoView({ behavior: "smooth" });
        })
        .catch(function (error) {
            showMessage(
                "Error: " + error.message,
                false
            );

            console.error(error);
        });
    });

    // Delete a donation
    function deleteDonation(id) {
        if (!id) {
            showMessage("This donation cannot be deleted because it has no ID.", false);
            return;
        }

        if (!confirm("Are you sure you want to delete this donation?")) {
            return;
        }

        fetch("/api/donations/" + encodeURIComponent(id), {
            method: "DELETE"
        })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(
                        data.message || "Could not delete donation."
                    );
                }

                return data;
            });
        })
        .then(function () {
            showMessage("Donation deleted successfully.", true);
            loadDonations();
        })
        .catch(function (error) {
            showMessage("Error: " + error.message, false);
        });
    }

    // Show existing donations when the page opens
    loadDonations();
});
