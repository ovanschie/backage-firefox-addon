#Backage In-browser packages
----------
**Backage is a simple proof-of-concept browser extension that aims at making webpages load faster, by sharing common Javascript libraries.**

The idea:

There are a lot of powerful Javascript libraries these days, which are gaining more and more popularity among webdevelopers. While these libraries provide awesome functionalities, they are also a cause of slow loading pages, especially when using multiple libraries in a single page. Luckily the browser caches (most of the time) the files downloaded from a single website.

But what if we could share these cached files between websites that use the same libraries? We could load a lot more files from the local cache, resulting in a decrease in loading time and bandwidth usage. Looking at how many sites that are using jQuery, Angular, Bootstrap or any other library / framework, imagine how much we could save!

The goal isn't about making one specific website load faster, it's about making browsing faster.

###How it works

----------
Imagine we have the following script tag:

    <script src="assets/libs/jquery-2.1.4.min.js"></script>
This tells the browser to include the jQuery library into the page, which is hosted on our server. The browser has no clue yet about the content of the script, so it downloads it regardless.

When we have Backage installed, we can tell the browser which libraries we want to use, instead of just linking to the necessary scripts. We can do this by adding some parameters to our script tag: `data-backage-name` and `data-backage-version`. When there is matching library found, Backage will download the library from Jsdelivr and loads it instead of the original source. When the package isn't found, or Backage is not installed, the browser will just use the original source as normal. When a specific version of a library is already downloaded before (on any website), then it just serves it from the local cache.

Example tag:

    <script src="assets/libs/jquery-2.1.4.min.js" data-backage-name="jquery" data-backage-version="2.1"></script>

- `data-backage-name` refers to any package name as listed on http://www.jsdelivr.com/ for example: `jquery`, `jquery.ui` or `bootstrap`
- `data-backage-version` refers to the desired version of the package. For example: `1.0.1` or `1.0` (leaving any .x version blank, will use the latest version in that version)

###Installation


----------

 2. Set `xpinstall.signatures.required` to `false` in `about:config`, to allow the installation (the addon is not yet signed at the moment).
 3. Restart your browser
 4. Open the .xpi file in your browser and hit 'Install'
 5. Navigate to any backage-ready webpage and see it in action

###Limitations

----------
- Due to file restrictions, the contents of the loaded libraries will be appended to the document.
- Libraries are not yet auto-updating.
