chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (command === "copy_commits") {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: () => {
                    console.log("👉 Getting all commits")
                    function copyLastNCommits() {
                        // Constants
                        const defaultNumCommitsToCopy = 3;
                        const gitCommitCherryPickCommand = 'gcp' // I set 'gpn' as a shortcut for 'git commit --cherry-pick';
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
                            let elementsWithClassName = Array.from(document.getElementsByClassName('js-commits-list-item')).reverse();

                            const commits = [];
                            for (let i = 0; i < Math.min(elementsWithClassName.length, numCommitsToCopy); i++) {
                                const firstATag = elementsWithClassName[i].querySelector('a');
                                if (firstATag) {
                                    const hrefParts = firstATag.href.split('/');
                                    commits.push(hrefParts[hrefParts.length - 1]);
                                }
                            }
                            return commits
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

                        const text = `${gitCommitCherryPickCommand} ${commits.reverse().join(" ")}`;
                        copyToClipboard(text);

                        console.log(`Copied to clipboard: "${text}"`);
                    }
                    copyLastNCommits();
                }
            });
        } else if (command === "hide_test_files") {
            chrome.scripting.executeScript(
                {
                    target: { tabId: activeTab.id },
                    function: () => {
                        const isTestFile = (fileName) => {
                            const testFileSuffixes = ["test.java", "test.go", ".bazel"]
                            return testFileSuffixes.some((suffix) => fileName.toLowerCase().endsWith(suffix))
                        }
                        const isGitFilesPage = () => {
                            const url = window.location.href;
                            return url.match(/https:\/\/github.com\/.*\/.*\/pull\/.*\/files/g) !== null;
                        }

                        if (!isGitFilesPage()) return;

                        const sideBarTestFiles = document.querySelectorAll("li.ActionList-item--subItem")
                        sideBarTestFiles.forEach((file) => {
                            const fileName = file.innerText;
                            const fileNameParts = fileName.split("\n");
                            if (fileNameParts.length === 1) {
                                if (file.role == 'treeitem' && isTestFile(fileName)) {
                                    file.style.opacity = 0.5;
                                }
                            }
                        })

                        const files = document.querySelectorAll(".file")
                        files.forEach((file) => {
                            const fileInfo = file.querySelector("span.Truncate");
                            const fileName = fileInfo.innerText;
                            if (isTestFile(fileName)) {
                                file.style.opacity = 0.5;
                                const button = file.querySelector("button.js-details-target");
                                if (button.getAttribute("aria-expanded") === "true") {
                                    button.click()
                                }
                            }
                        })
                    },
                }
            );
        } else if (command = "open_execution_parameters") {
            chrome.scripting.executeScript(
                {
                    target: { tabId: activeTab.id },
                    function: () => {
                        // Select all div elements with the class name "execution-parameters-button"
                        const divs = document.querySelectorAll('div.execution-parameters-button');

                        // Loop through each div element
                        divs.forEach(div => {
                            // Select all a tags within the current div
                            const links = div.querySelectorAll('a');

                            // Loop through each a tag and click it
                            links.forEach(link => {
                                link.click();
                            });
                        });
                    },
                }
            );
        }
    })
});
