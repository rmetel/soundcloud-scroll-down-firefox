// Copyright (c) 21.12.2017 Ralph Metel. All rights reserved.
// Email: ralph.metel@gmail.com
// For free use

var interval, desiredDateMilliseconds;

function scrollPage() {
    scrollTo({
        'top': document.body.scrollHeight
    });

    var allPosts = document.getElementsByClassName('relativeTime'),
        lastPost = allPosts[allPosts.length - 1],
        lastPostDateMilliseconds = new Date(lastPost.getAttribute('datetime')).getTime();

    if(lastPostDateMilliseconds <= desiredDateMilliseconds) {
        // Cancel scrolling
        clearInterval(interval);
        // Notify extension
        notifyExtensionScrollingStopped();

        // Adjust the page, scroll to first post within desired date
        for (i = allPosts.length - 1; i > 0; i--) {
            if(new Date(allPosts[i].getAttribute('datetime')).getTime() >= desiredDateMilliseconds) {
                if(i < (allPosts.length - 1)) i++; // Go back to previous item

                allPosts[i].scrollIntoView();
                scrollTo(0, document.documentElement.scrollTop - 100);
                break;
            }
        }
    }
}

/**
 * Notifies extension about stopped scrolling
 */
function notifyExtensionScrollingStopped(){
    browser.runtime.sendMessage({'message': 'stopped'});
}

/**
 * Init function
 */
function initSearch(desiredDate) {
    var allPosts = document.getElementsByClassName('relativeTime'),
        lastPost = allPosts[allPosts.length - 1],
        lastPostDateMilliseconds = new Date(lastPost.getAttribute('datetime')).getTime();

    desiredDateMilliseconds = new Date(desiredDate).getTime();

    // If last post date is smaller than the desired date (last post is older that the desired one), it means the needed item is already on page
    if (lastPostDateMilliseconds <= desiredDateMilliseconds) {
        // Adjust the page, scroll to first post within desired date
        for (i = allPosts.length - 1; i > 0; i--) {
            if (new Date(allPosts[i].getAttribute('datetime')).getTime() >= desiredDateMilliseconds) {
                if(i < (allPosts.length - 1)) i++; // Go back to previous item

                allPosts[i].scrollIntoView();
                scrollTo(0, document.documentElement.scrollTop - 100);
                break;
            }
        }
        // Notify extension
        notifyExtensionScrollingStopped();
    } else {
        // Start scrolling down the page
        interval = setInterval(scrollPage, 100);
    }
}

/**
 * Listen for messages from the background script.
 */
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "search") {
        initSearch(message.desiredDate);
    } else if (message.command === "stop") {
        // Cancel scrolling
        clearInterval(interval);
        // Notify extension
        notifyExtensionScrollingStopped();
    }
});