# [SCIENTILLA](http://www.scientilla.net)

### SCIENTIfic coLLaborative Archive

#####*The first Independent Scientific Register for Organizations and Researchers*

SCIENTILLA is: a free network for exchanging bibliographic metadata and a software in order to access to this network.

The network is designed for organizations and researchers to manage, share and promote metadata relating to their scientific publications. Data can be completely shared by all the members of the network and they will always be open.

Organizations and researchers can then work together helping to improve the quality and the accuracy of the bibliographic metadata.

The software is open source, editable and extensible.

The main functionalities can be summarized in four points:
* Organization of publications found on your installation
* Sharing of publications found on your installation
* Aggregation of publications in other remote installations
* Integration of publications available on other web resources

**Organization** 

The system allows users to enter metadata regarding their scientific publications (references) that are stored locally.
The references can be checked, corrected and "signed" by the authors and the institutions that produced them.

**Sharing**

The system allows users to choose the references to share with the SCIENTILLA community and sign them with users' profile.
Each installation (peer) can thus view the data of all the others.
Through this mechanism, based on a peer-to-peer architecture, users can work together to clean and refine data and identify their "fatherhood".
The Profile is the set of information that unequivocally identifies the user on SCIENTILLA.

**Aggregation**

The system allows each installation to collect and process the data shared with/by the other installations in order to extract information on the following:
* how many versions there are of the same reference and easily figure out the most trusted by the other users
* the list of researchers authors of publications in the network
* the list of organizations involved in publications in the network
* the list of publications related to a researcher profile on SCIENTILLA
* the list of publications related to an organization profile on SCIENTILLA
* the list of publications related to an URL or IP address from which they were pick up (source installation)

**Integration**

The system allows you to configure the interface with other data resources that share information about scientific production metadata in order to allow the user to search for references and import them.
In this way you can quickly define and complete your references list.



## IMPORTANT

SCIENTILLA is in Alpha phase. While we are writing documentation to help people using it, as well as contributing to the development, it is at moment recommended only for a technical audience.



## Using SCIENTILLA

Scientilla is a web application that works also from your desktop and that is compatible with Windows, Mac and Linux. You can download the installation package and run it from your hardware and networking facilities or request a demo on [http://www.scientilla.net](http://www.scientilla.net) so that you can check what the software does.



## Extending SCIENTILLA

The development of Scientilla continues constantly and collaborations are really wanted and accepted.



## Installing SCIENTILLA

**Manual Procedure**

- *1) Download the Scientilla Zip package from <http://www.scientilla.net>.*

- *2) Execute one of the following steps group:*

    **Windows 32bit:**
    Unzip the Scientilla Zip package and copy its content into your preferred path (for example "C:\Program Files (x86)\Scientilla\").

    **Windows 64bit:**
    Unzip the Scientilla Zip package and copy its content into your preferred path (for example "C:\Program Files\Scientilla\").

    **Linux 32bit or 64bit:**
    Unzip the Scientilla Zip package and copy its content into your preferred path (for example "/opt/scientilla/").

    **Max OSX 32bit or 64bit:**
    Unzip the Scientilla Zip package and copy its content into your preferred path (for example "/Applications/Scientilla/").

- *3) If your Operating System is Windows execute the following step:*

    Download the NSSM Zip package from <https://nssm.cc>.

- *4) If your Operating System is Windows execute one of the following steps group:*

    **Windows 32bit:**
    Unzip the NSSM Zip package and copy its content into a sub-folder of the Scientilla path (for example "C:\Program Files (x86)\Scientilla\nssm\").

    **Windows 64bit:**
    Unzip the NSSM Zip package and copy its content into a sub-folder of the Scientilla path (for example "C:\Program Files\Scientilla\nssm\").

- *5) Execute one of the following steps group:*

    **Windows 32bit:**
    Download, from <http://nodejs.org>, the 32-bit Windows Installer (.msi) package.
    Install the package.

    **Windows 32bit (alternative method):**
    Download, from <http://nodejs.org>, the 32-bit Windows Binary (.exe) file.
    Copy the file into a sub-folder of the Scientilla path (for example "C:\Program Files (x86)\Scientilla\node\").

    **Windows 64bit:**
    Download, from <http://nodejs.org>, the 64-bit Windows Installer (.msi) package.
    Install the package.

    **Windows 64bit (alternative method):**
    Download, from <http://nodejs.org>, the 64-bit Windows Binary (.exe) file.
    Copy the file into a sub-folder of the Scientilla path (for example "C:\Program Files\Scientilla\node\").

    **Linux 32bit:**
    Download, from <http://nodejs.org>, the 32-bit Linux Binaries (.tar.gz) package.
    Unzip the package and copy its content into a sub-folder of the Scientilla path (for example "/opt/scientilla/node/").

    **Linux 64bit:**
    Download, from <http://nodejs.org>, the 64-bit Linux Binaries (.tar.gz) package.
    Unzip the package and copy its content into a sub-folder of the Scientilla path (for example "/opt/scientilla/node/").

    **Mac OS X 32bit or 64bit:**
    Download, from <http://nodejs.org>, the Universal Mac OS X Installer (.pkg) package.
    Install the package.

    **Mac OS X 32bit (alternative method):**
    Download, from <http://nodejs.org>, the 32-bit Mac OS X Binaries (.tar.gz) package.
    Unzip the package and copy its content into a sub-folder of the Scientilla path (for example "/Applications/Scientilla/node/").

    **Mac OS X 64bit (alternative method):**
    Download, from <http://nodejs.org>, the 64-bit Mac OS X Binaries (.tar.gz) package.
    Unzip the package and copy its content into a sub-folder of the Scientilla path (for example "/Applications/Scientilla/node/").

- *6) Execute one of the following steps group:*

    **Windows 32bit:** 
    a) Locate the "Command Prompt" link into your Windows Menu, right click on the icon and then click on "Run As Administrator".
    b) Write and run the following command into the "Command Prompt" window: 
           C:\Program Files\Scientilla\nssm\win32\nssm.exe install Scientilla "C:\Program Files\Node.js\node.exe" "C:\Program Files\Scientilla\server\bootstrap.js"
           ATTENTION: if you have not copied Scientilla under C:\Program Files\Scientilla\ and NSSM under C:\Program Files\Scientilla\nssm\ please substitute the right paths into the above command.
    c) Write and run the following command into the "Command Prompt" window:
           net start Scientilla
    d) Close the "Command Prompt" window.
    e) Open your preferred browser and navigate the following URL:
           <https://localhost:60000> 

    **Windows 64bit:** 
    a) Locate the "Command Prompt" link into your Windows Menu, right click on the icon and then click on "Run As Administrator".
    b) Write and run the following command into the "Command Prompt" window: 
           C:\Program Files\Scientilla\nssm\win64\nssm.exe install Scientilla "C:\Program Files\Node.js\node.exe" "C:\Program Files\Scientilla\server\bootstrap.js"
           ATTENTION: if you have not copied Scientilla under C:\Program Files\Scientilla\ and NSSM under C:\Program Files\Scientilla\nssm\ please substitute the right paths into the above command.
    c) Write and run the following command into the "Command Prompt" window:
           net start Scientilla
    d) Close the "Command Prompt" window.
    e) Open your preferred browser and navigate the following URL:
           <https://localhost:60000>

    **Linux 32bit:**
    a) Modify the file /etc/rc.local and add to it the following line:
           /opt/scientilla/node/bin/node /opt/scientilla/server/bootstrap.js
    b) Open a "Terminal" window.
    c) Write and run the following command into the "Terminal" window:
           nohup /opt/scientilla/node/bin/node /opt/scientilla/server/bootstrap.js
    d) Close the "Terminal" window.
    e) Open your preferred browser and navigate the following URL:
           <https://localhost:60000>

    **Linux 64bit:**
    a) Modify the file /etc/rc.local and add to it the following line:
           /opt/scientilla/node/bin/node /opt/scientilla/server/bootstrap.js
    b) Open a "Terminal" window.
    c) Write and run the following command into the "Terminal" window:
           nohup /opt/scientilla/node/bin/node /opt/scientilla/server/bootstrap.js
    d) Close the "Terminal" window.
    e) Open your preferred browser and navigate the following URL:
           <https://localhost:60000>

    **Mac OS X 32bit or 64bit:**
    a) Create the file /Library/LaunchAgents/net.scientilla.application.plist and fill it with the following content:
           <?xml version="1.0" encoding="UTF-8"?>
           <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
           <plist version="1.0">
               <dict>
                   <key>Label</key>
                   <string>net.scientilla.application</string>
                   <key>OnDemand</key>
                   <false/>
                   <key>scientilla</key>
                   <string>Scientilla</string>
                   <key>scientilla</key>
                   <string>Scientilla</string>
                   <key>ProgramArguments</key>
                   <array>
                       <string>node</string>
                       <string>/Applications/Scientilla/server/bootstrap.js</string>
                   </array>
               </dict>
           </plist>
    b) Open a "Terminal" window.
    c) Write and run the following command into the "Terminal" window:
       sudo launchctl load /Library/LaunchAgents/net.scientilla.application.plist
    d) Close the "Terminal" window.
    e) Open your preferred browser and navigate the following URL:
           <https://localhost:60000>

    **Mac OSX 32bit (alternative method):**
    a) Create the file /Library/LaunchAgents/net.scientilla.application.plist and fill it with the following content:
           <?xml version="1.0" encoding="UTF-8"?>
           <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
           <plist version="1.0">
               <dict>
                   <key>Label</key>
                   <string>net.scientilla.application</string>
                   <key>OnDemand</key>
                   <false/>
                   <key>scientilla</key>
                   <string>Scientilla</string>
                   <key>scientilla</key>
                   <string>Scientilla</string>
                   <key>ProgramArguments</key>
                   <array>
                       <string>/Applications/Scientilla/node/node</string>
                       <string>/Applications/Scientilla/server/bootstrap.js</string>
                   </array>
               </dict>
           </plist>
    b) Open a "Terminal" window.
    c) Write and run the following command into the "Terminal" window:
       sudo launchctl load /Library/LaunchAgents/net.scientilla.application.plist
    d) Close the "Terminal" window.
    e) Open your preferred browser and navigate the following URL:
           <https://localhost:60000>

    **Mac OSX 64bit (alternative method):**
    a) Create the file /Library/LaunchAgents/net.scientilla.application.plist and fill it with the following content:
           <?xml version="1.0" encoding="UTF-8"?>
           <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
           <plist version="1.0">
               <dict>
                   <key>Label</key>
                   <string>net.scientilla.application</string>
                   <key>OnDemand</key>
                   <false/>
                   <key>scientilla</key>
                   <string>Scientilla</string>
                   <key>scientilla</key>
                   <string>Scientilla</string>
                   <key>ProgramArguments</key>
                   <array>
                       <string>/Applications/Scientilla/node/node</string>
                       <string>/Applications/Scientilla/server/bootstrap.js</string>
                   </array>
               </dict>
           </plist>
    b) Open a "Terminal" window.
    c) Write and run the following command into the "Terminal" window:
       sudo launchctl load /Library/LaunchAgents/net.scientilla.application.plist
    d) Close the "Terminal" window.
    e) Open your preferred browser and navigate the following URL:
           <https://localhost:60000>



## Sponsor

** Istituto Italiano di Tecnologia

- <http://www.iit.it>



## Inventors

** Antonio De Luca

- <http://www.iit.it/en/people/antonio-deluca.html>
- <http://www.antoniodeluca.info>

** Elisa Molinari

- <http://www.iit.it/en/people/elisa-molinari.html>
- <http://www.elisamolinari.info>

** Eleonora Palmaro

- <http://www.iit.it/en/people/eleonora-palmaro.html>
- <http://www.eleonorapalmaro.info>



## Team

**The Inventors &

**Federico Bozzini

- <http://www.iit.it/en/people/federico-bozzini.html>



## Copyright and License

Code and Documentation Copyright (c) 2014 Istituto Italiano di Tecnologia - Code released under the [MIT license](LICENSE). Documentation released under the Creative Commons license.