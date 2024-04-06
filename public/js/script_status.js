document.getElementById("trackButton").addEventListener("click", function() {
    var complaintID = document.getElementById("complaintID").value;
    
    // Dummy AJAX call to simulate fetching complaint status history
    fetch("complaint_status_api.php?complaintID=" + complaintID)
        .then(response => response.json())
        .then(data => {
            updateProgressBar(data);
        })
        .catch(error => console.error('Error:', error));
});

function updateProgressBar(statusHistory) {
    var progressBar = document.getElementById("progressBar");
    var statusText = document.getElementById("statusText");
    
    if (statusHistory.length === 0) {
        statusText.textContent = "No status found for this complaint ID.";
        progressBar.innerHTML = '';
    } else {
        var stageWidth = 100 / statusHistory.length;
        var progressBarHTML = '';

        statusHistory.forEach(function(status) {
            progressBarHTML += '<div class="progress-bar-inner ' + status.toLowerCase() + '" style="width: ' + stageWidth + '%;"></div>';
        });

        progressBar.innerHTML = progressBarHTML;
        statusText.textContent = "Latest Status: " + statusHistory[statusHistory.length - 1];
    }
}
