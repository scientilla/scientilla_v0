# [SCIENTILLA](http://www.scientilla.net)

## SCIENTIfic coLLaborative Archive

####*The first Independent Scientific Register for Organizations and Researchers*

SCIENTILLA is: a free network for exchanging bibliographic metadata and a software in order to access to this network.

The network is designed for organizations and researchers to manage, share and promote metadata relating to their scientific publications. Data can be completely shared by all the members of the network and they will always be open.

Organizations and researchers can then work together helping to improve the quality and the accuracy of the bibliographic metadata.

The software is open source, editable and extensible.

The main functionalities can be summarized in four points:
* Organization of publications found on your installation
* Sharing of publications found on your installation
* Aggregation of publications in other remote installations
* Integration of publications available on other web resources

####Organization 

The system allows users to enter metadata regarding their scientific publications (references) that are stored locally.
The references can be checked, corrected and "signed" by the authors and the institutions that produced them.

####Sharing

The system allows users to choose the references to share with the SCIENTILLA community and sign them with users' profile.
Each installation (peer) can thus view the data of all the others.
Through this mechanism, based on a peer-to-peer architecture, users can work together to clean and refine data and identify their "fatherhood".
The Profile is the set of information that unequivocally identifies the user on SCIENTILLA.

####Aggregation

The system allows each installation to collect and process the data shared with/by the other installations in order to extract information on the following:
* how many versions there are of the same reference and easily figure out the most trusted by the other users
* the list of researchers authors of publications in the network
* the list of organizations involved in publications in the network
* the list of publications related to a researcher profile on SCIENTILLA
* the list of publications related to an organization profile on SCIENTILLA
* the list of publications related to an URL or IP address from which they were pick up (source installation)

####Integration

The system allows you to configure the interface with other data resources that share information about scientific production metadata in order to allow the user to search for references and import them.
In this way you can quickly define and complete your references list.



## IMPORTANT

After 8 months of Alpha phase SCIENTILLA is now in Beta phase. 
We are writing documentation to help final users using it as well as to help developers contributing to the advancement of the project.
Consider that you could experiment minor malfunctions until we are in the Beta phase.



## ATTENTION

MongoDB support is not stable at moment.
While you can see the configuration selector into your installation is highly suggested to not use it untile the feature will be declared stable.



## How to install SCIENTILLA

####Guided Procedure

1. Depending on your operating system download the appropriate Installation package from <http://www.scientilla.net> and install it.

2. Open your preferred browser and navigate the following URL:

   <https://localhost/>

####Manual Procedure

1. **Windows 32bit**

  - Download the Scientilla Zip package (Any OS) from <http://www.scientilla.net>.**
  - Unzip the Scientilla Zip package and copy its content into your preferred path (for example "C:\Program Files (x86)\Scientilla\").
  - Download the NSSM Zip package from <https://nssm.cc>.
  - Unzip the NSSM Zip package and copy its content into a sub-folder of the Scientilla path (for example "C:\Program Files (x86)\Scientilla\nssm\").
  - Download, from <http://nodejs.org>, the 32-bit Windows Binary (.exe) file.
  - Copy the file into a sub-folder of the Scientilla path (for example "C:\Program Files (x86)\Scientilla\node\").
  - Locate the "Command Prompt" link into your Windows Menu, right click on the icon and then click on "Run As Administrator".
  - Write and run the following command into the "Command Prompt" window:

    **C:\Program Files (x86)\Scientilla\nssm\win32\nssm.exe install Scientilla "C:\Program Files (x86)\Scientilla\node\node.exe" "C:\Program Files (x86)\Scientilla\server\bootstrap.js"**
      
    ATTENTION: if you have not copied Scientilla under C:\Program Files (x86)\Scientilla\, NSSM under C:\Program Files (x86)\Scientilla\nssm\ and Node.js under C:\Program Files (x86)\Scientilla\node\ please substitute the right paths into the above command.

  - Write and run the following command into the "Command Prompt" window:

    **net start Scientilla**

  - Close the "Command Prompt" window.
  - Open your preferred browser and navigate the following URL:

    <https://localhost/> 

2. **Windows 64bit**

  - Download the Scientilla Zip package (Any OS) from <http://www.scientilla.net>.**
  - Unzip the Scientilla Zip package and copy its content into your preferred path (for example "C:\Program Files\Scientilla\").
  - Download the NSSM Zip package from <https://nssm.cc>.
  - Unzip the NSSM Zip package and copy its content into a sub-folder of the Scientilla path (for example "C:\Program Files\Scientilla\nssm\").
  - Download, from <http://nodejs.org>, the 32-bit Windows Binary (.exe) file.
  - Copy the file into a sub-folder of the Scientilla path (for example "C:\Program Files (x86)\Scientilla\node\").
  - Locate the "Command Prompt" link into your Windows Menu, right click on the icon and then click on "Run As Administrator".
  - Write and run the following command into the "Command Prompt" window:
 
    **C:\Program Files\Scientilla\nssm\win64\nssm.exe install Scientilla "C:\Program Files\Scientilla\node\node.exe" "C:\Program Files\Scientilla\server\bootstrap.js"**
      
    ATTENTION: if you have not copied Scientilla under C:\Program Files\Scientilla\, NSSM under C:\Program Files\Scientilla\nssm\ and Node.js under C:\Program Files\Scientilla\node\ please substitute the right paths into the above command.

  - Write and run the following command into the "Command Prompt" window:

    **net start Scientilla**

  - Close the "Command Prompt" window.
  - Open your preferred browser and navigate the following URL:

    <https://localhost/>

3. **Linux 32bit**

  - Download the Scientilla Zip package (Any OS) from <http://www.scientilla.net>.**
  - Unzip the Scientilla Zip package and copy its content into your preferred path (for example "/opt/scientilla/").
  - Download, from <http://nodejs.org>, the 32-bit Linux Binaries (.tar.gz) package.
  - Unzip the package and copy its content into a sub-folder of the Scientilla path (for example "/opt/scientilla/node/").
  - Modify the file /etc/rc.local and add to it the following line:

    **/opt/scientilla/node/bin/node /opt/scientilla/server/bootstrap.js**

  - Open a "Terminal" window.
  - Write and run the following command into the "Terminal" window:

    **nohup /opt/scientilla/node/bin/node /opt/scientilla/server/bootstrap.js**

  - Close the "Terminal" window.
  - Open your preferred browser and navigate the following URL:

    <https://localhost/>

4. **Linux 64bit**

  - Download the Scientilla Zip package (Any OS) from <http://www.scientilla.net>.**
  - Unzip the Scientilla Zip package and copy its content into your preferred path (for example "/opt/scientilla/").
  - Download, from <http://nodejs.org>, the 64-bit Linux Binaries (.tar.gz) package.
  - Unzip the package and copy its content into a sub-folder of the Scientilla path (for example "/opt/scientilla/node/").
  - Modify the file /etc/rc.local and add to it the following line:

    **/opt/scientilla/node/bin/node /opt/scientilla/server/bootstrap.js**

  - Open a "Terminal" window.
  - Write and run the following command into the "Terminal" window:

    **nohup /opt/scientilla/node/bin/node /opt/scientilla/server/bootstrap.js**

  - Close the "Terminal" window.
  - Open your preferred browser and navigate the following URL:

    <https://localhost/>

5. **Mac OS X 32bit**

  - Download the Scientilla Zip package (Any OS) from <http://www.scientilla.net>.**
  - Unzip the Scientilla Zip package and copy its content into your preferred path (for example "/Applications/Scientilla/").
  - Download, from <http://nodejs.org>, the 64-bit Mac OS X Binaries (.tar.gz) package.
  - Unzip the package and copy its content into a sub-folder of the Scientilla path (for example "/Applications/Scientilla/node/").
  - Create the file /Library/LaunchAgents/net.scientilla.application.plist and fill it with the following content:
    <pre>
        &lt;?xml version="1.0" encoding="UTF-8"?&gt;
        &lt;!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"&gt;
        &lt;plist version="1.0"&gt;
            &lt;dict&gt;
                &lt;key&gt;Label&lt;/key&gt;
                &lt;string&gt;net.scientilla.application&lt;/string&gt;
                &lt;key&gt;UserName&lt;/key&gt;
                &lt;string&gt;{{write here your username}}&lt;/string&gt;
                &lt;key&gt;GroupName&lt;/key&gt;
                &lt;string&gt;{{write here your groupname}}&lt;/string&gt;
                &lt;key&gt;ProgramArguments&lt;/key&gt;
                &lt;key&gt;OnDemand&lt;/key&gt;
                &lt;false/&gt;
                &lt;key&gt;KeepAlive&lt;/key&gt;
                &lt;true/&gt;
                &lt;key&gt;RunAtLoad&lt;/key&gt;
                &lt;true/&gt;
                &lt;array&gt;
                    &lt;string&gt;/Applications/Scientilla/node/node&lt;/string&gt;
                    &lt;string&gt;/Applications/Scientilla/server/bootstrap.js&lt;/string&gt;
                &lt;/array&gt;
            &lt;/dict&gt;
        &lt;/plist&gt;
    </pre>

  - Open a "Terminal" window.
  - Write and run the following command into the "Terminal" window:

    **sudo launchctl load /Library/LaunchAgents/net.scientilla.application.plist**

  - Close the "Terminal" window.
  - Open your preferred browser and navigate the following URL:

    <https://localhost/>

6. **Mac OS X 64bit**

  - Download the Scientilla Zip package (Any OS) from <http://www.scientilla.net>.**
  - Unzip the Scientilla Zip package and copy its content into your preferred path (for example "/Applications/Scientilla/").
  - Download, from <http://nodejs.org>, the 64-bit Mac OS X Binaries (.tar.gz) package.
  - Unzip the package and copy its content into a sub-folder of the Scientilla path (for example "/Applications/Scientilla/node/").
  - Create the file /Library/LaunchAgents/net.scientilla.application.plist and fill it with the following content:
    <pre>
        &lt;?xml version="1.0" encoding="UTF-8"?&gt;
        &lt;!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"&gt;
        &lt;plist version="1.0"&gt;
            &lt;dict&gt;
                &lt;key&gt;Label&lt;/key&gt;
                &lt;string&gt;net.scientilla.application&lt;/string&gt;
                &lt;key&gt;UserName&lt;/key&gt;
                &lt;string&gt;{{write here your username}}&lt;/string&gt;
                &lt;key&gt;GroupName&lt;/key&gt;
                &lt;string&gt;{{write here your groupname}}&lt;/string&gt;
                &lt;key&gt;ProgramArguments&lt;/key&gt;
                &lt;key&gt;OnDemand&lt;/key&gt;
                &lt;false/&gt;
                &lt;key&gt;KeepAlive&lt;/key&gt;
                &lt;true/&gt;
                &lt;key&gt;RunAtLoad&lt;/key&gt;
                &lt;true/&gt;
                &lt;array&gt;
                    &lt;string&gt;/Applications/Scientilla/node/node&lt;/string&gt;
                    &lt;string&gt;/Applications/Scientilla/server/bootstrap.js&lt;/string&gt;
                &lt;/array&gt;
            &lt;/dict&gt;
        &lt;/plist&gt;
    </pre>

  - Open a "Terminal" window.
  - Write and run the following command into the "Terminal" window:

    **sudo launchctl load /Library/LaunchAgents/net.scientilla.application.plist**

  - Close the "Terminal" window.
  - Open your preferred browser and navigate the following URL:

    <https://localhost/>



## How to use SCIENTILLA

Scientilla is a web application that works also from your desktop and that is compatible with Windows, Mac and Linux. You can download the installation package and run it from your hardware and networking facilities or request a demo on [http://www.scientilla.net](http://www.scientilla.net) so that you can check what the software does.






## How run multiple SCIENTILLA installations

####Manual Procedure

1. **Linux 32bit and 64bit**

  - Install more than one copy of the Scientilla Zip package using different folders.
  - Follow these steps for every Scientilla Zip package installed copy:
  - **For each installation**: Edit the installation.json file that you can find under **[/path/of/the/folder/where/you/installed/the/scientilla/copy]**/server/configuration/
  - **For each installation**: Update the "port" property to a value different than those in other installed copies.
  - **For each installation**: Update the "url" property so that it doesn't include the above specified port.
  - Install the NGINX server.
  - Applying the below reported example, create one NGINX virtual host configuration file per each installed Scientilla Zip package copy.
    <pre>
    server {
        listen 443 ssl;
        server_name **[the-value-of-the-url-property-for-the-scientilla-copy]**;
        ssl_certificate **[/path/of/the/folder/where/you/installed/the/scientilla/copy]**/certs/certificate.cert;
        ssl_certificate_key **[/path/of/the/folder/where/you/installed/the/scientilla/copy]**/certs/certificate.key;
        location / {
            proxy_pass https://localhost:**[the-value-of-the-url-property-for-the-scientilla-copy]**;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    </pre>
  - Start the installed Scientilla Zip package copies.
  - Start the NGINX server.



## How to configure SCIENTILLA

####Other Resources

Scientilla supports access to public web services like ORCID and/or organization specific ones that help you locate and report your scientific production.
These web services can be configured into the application under the "Other Resources" section.
Normally these web services have a "personalized" configuration so you are called to correctly set the entries as by your need.

Example:

To configure the ORCID web service follow this steps:

- Log into your Scientilla Installation
- Click the [Other Resources] link on the sidebar menu
- Press the [+] button on the upper-right part of the page
- Enter the following value in the Name field: ```ORCID```
- Enter the following value in the URL field: ```http://feed.labs.orcid-eu.org/{{write here your ORCID identifier}}.json```
- Enter the following value in the Authors field: ```author```
- Enter the following value in the Authors RegExp field: ```(?:{"family":"([a-zA-Z0-9]+)","given":"([a-zA-Z0-9]+)"}(,)?)```
- Enter the following value in the Year field: ```issued```
- Enter the following value in the Year RegExp field: ```.*\[\[([0-9]+)\]\].*```
- Click the Update button
- Click the [Open] button on the left of the new ORCID entry
- Click on the [Clone] button to import the information about a specific publication into the [Your Works!] area



## How to extend SCIENTILLA

The development of Scientilla continues constantly and collaborations are really wanted and accepted.
If you are a developer Fork the project and send us Pull Requests.
If you want to contribute with translation please send us an email so we can keep in touch while we implement the multilingual system.



## Supporter

**Istituto Italiano di Tecnologia**

- <http://www.iit.it>



## Inventors

**Antonio De Luca**

- <http://www.iit.it/en/people/antonio-deluca.html>
- <http://www.antoniodeluca.info>

**Elisa Molinari**

- <http://www.iit.it/en/people/elisa-molinari.html>
- <http://www.elisamolinari.info>

**Eleonora Palmaro**

- <http://www.iit.it/en/people/eleonora-palmaro.html>
- <http://www.eleonorapalmaro.info>



## Team

**The Inventors &**

**Federico Bozzini**

- <http://www.iit.it/en/people/federico-bozzini.html>



## Copyright and License

Code and Documentation Copyright (c) 2014 Istituto Italiano di Tecnologia - Code released under the [MIT license](LICENSE). Documentation released under the Creative Commons license.