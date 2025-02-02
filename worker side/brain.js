// JavaScript to handle button clicks and show appropriate content
document.getElementById('oldAuctions').addEventListener('click', function() {
    document.getElementById('content').innerHTML = `
        <h2>Old Auctions</h2>
        <p>Here are the details of the old auctions.</p>
    `;
});

document.getElementById('recentAuctions').addEventListener('click', function() {
    document.getElementById('content').innerHTML = `
        <h2>Recent Auctions</h2>
        <p>Here are the details of the recent auctions.</p>
    `;
});
