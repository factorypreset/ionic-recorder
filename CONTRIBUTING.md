# based on
# https://github.com/yeoman/yeoman/blob/master/contributing.md

# NB: not yet fully edited, names still need to be changed and words edited.

# Contributing

We are more than happy to accept external contributions to the project in the form of feedback, bug reports and even better - pull requests :)


## Issue submission

In order for us to help you please check that you've completed the following steps:

* Made sure you're on the latest version
* Made sure your version of the app
* Used the search feature to ensure that the bug hasn't been reported before
* Included as much information about the bug as possible, including any output you've received, what OS and version you're on, other relevant software versions (e.g. npm, node, ionic2, angular2).
* Shared the output from running the following command in your project root as this can also help track down the issue.

    # cd ionic-recorder
    # npm test

[Submit your issue](https://github.com/tracktunes/ionic-recorder/issues/new)


## Quick Start

- Clone the repo of [ionic-recorder](https://github.com/tracktunes/ionic-recorder)


You can keep the various repos up to date by running `git pull --rebase upstream master` in each.


## Style Guide

Please refer to the style guild [TODO: add page and link to STYLE.md]

Please ensure any pull requests follow this closely. If you notice existing code which doesn't follow these practices, feel free to shout and we will address this.


## Pull Request Guidelines

* Please check to make sure that there aren't existing pull requests attempting to address the issue mentioned. We also recommend checking for issues related to the issue on the tracker, as a team member may be working on the issue in a branch or fork.
* Non-trivial changes should be discussed in an issue first
* Develop in a topic branch, not master
* Lint the code by running `grunt`
* Add relevant tests to cover the change
* Make sure test-suite passes: `npm test`
* Squash your commits
* Write a convincing description of your PR and why we should land it
* Check the individual project to see if there is a **contributing.md** or similar file as some project's have different requirements.
