function copyLastNCommits() {
    // Constants
    const defaultNumCommitsToCopy = 3;
    const gitCommitCherryPickCommand = 'gpn' // I set 'gpn' as a shortcut for 'git commit --cherry-pick';
    const numCommitsToCopyPrompt = 'How many commits do you want to copy?';

    // Function definitions
    // Seems like you cannot define + use functions outside of the function that is passed to executeScript
    const copyToClipboard = (text) => {
        const range = document.createRange();
        const selection = window.getSelection();

        // Create a temporary element to hold the text
        const tempElement = document.createElement('span');
        tempElement.textContent = text;
        document.body.appendChild(tempElement);

        // Select the text inside the temporary element
        range.selectNodeContents(tempElement);
        selection.removeAllRanges();
        selection.addRange(range);

        // Copy the selected text to the clipboard
        document.execCommand('copy');

        // Clean up and remove the temporary element
        document.body.removeChild(tempElement);
    }
    const getCommitsFromPage = () => {
        const elementsWithClassName = Array.from(document.getElementsByClassName('js-commits-list-item')).reverse();

        const commits = [];
        for (let i = 0; i < Math.min(elementsWithClassName.length, numCommitsToCopy); i++) {
            const firstATag = elementsWithClassName[i].querySelector('a');
            if (firstATag) {
                const hrefParts = firstATag.href.split('/');
                commits.push(hrefParts[hrefParts.length - 1]);
            }
        }
    }
    const isGitCommitsPage = () => {
        const url = window.location.href;
        return url.match(/https:\/\/github.com\/.*\/.*\/pull\/.*\/commits/g) !== null;
    }

    // Main
    if (!isGitCommitsPage()) return;

    const numCommitsToCopy = prompt(numCommitsToCopyPrompt, defaultNumCommitsToCopy);
    if (!numCommitsToCopy) return;

    const commits = getCommitsFromPage();

    const text = gitCommitCherryPickCommand + commits.reverse().join(" ");
    copyToClipboard(text);

    console.log('Copied to clipboard: ' + text);
}

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyLastNCommits,
    });
});
