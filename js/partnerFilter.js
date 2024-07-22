// partnerFilter.js

// Define an array of partners with their categories and image URLs
const partners = [
    // Cloud Service Providers
    { name: "Amazon Web Services (AWS)", logo: "https://d1.awsstatic.com/r2023/images/logos/aws_logo_smile_1200x630.png" },
    { name: "Microsoft Azure", logo: "https://azurecomcdn.azureedge.net/cvt-9b5d4e8de7a0dfb2bcd1588c91ba648ecee223bfae3e7c3ff7d3b7697ebd4edb/images/page/home/header/logo-azure.svg" },
    { name: "Google Cloud Platform (GCP)", logo: "https://cloud.google.com/images/social-icon-google-cloud-1200-630.png" },
    { name: "IBM Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/IBM_Cloud_logo.png" },
    { name: "Oracle Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Oracle_Logo_Red_600x180.png" },
    { name: "Alibaba Cloud", logo: "https://img.alicdn.com/tfs/TB1ywPRRVXXXXXlXXXXXXXXXXXX-380-100.png" },
    { name: "DigitalOcean", logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/DigitalOcean_logo.png" },
    { name: "Linode", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Linode_logo.svg" },
    
    // Cybersecurity Providers
    { name: "McAfee", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3b/McAfee_logo.svg" },
    { name: "Symantec", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Symantec_logo.svg" },
    { name: "Trend Micro", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Trend_Micro_logo.svg/1280px-Trend_Micro_logo.svg.png" },
    { name: "Fortinet", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Fortinet_logo.svg" },
    { name: "Palo Alto Networks", logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Palo_Alto_Networks_Logo.png" },
    { name: "Checkpoint", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Check_Point_logo.svg" },
    { name: "CrowdStrike", logo: "https://upload.wikimedia.org/wikipedia/commons/3/37/CrowdStrike_logo.png" },
    { name: "FireEye", logo: "https://upload.wikimedia.org/wikipedia/commons/5/55/FireEye_Logo.svg" },
    { name: "Kaspersky", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Kaspersky_Lab_logo.svg" },
    { name: "Sophos", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Sophos_logo.svg" },
    { name: "Cyber Retaliator Solutions", logo: "https://github.com/skunkworksza/web/blob/main/assets/crs/cyber-retaliator-solutions-cyber-security-za-web.png?raw=true" },
    
    // Hardware Vendors
    { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg" },
    { name: "HP (Hewlett-Packard)", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5a/HP_logo_2012.svg" },
    { name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Lenovo_logo.svg" },
    { name: "Intel", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel_logo_%282020%2C_dark_blue%29.svg" },
    { name: "AMD (Advanced Micro Devices)", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/AMD_Logo.svg" },
    { name: "Cisco", logo: "https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg" },
    { name: "Juniper Networks", logo: "https://upload.wikimedia.org/wikipedia/commons/7/79/Juniper_Networks_logo.svg" },
    { name: "Arista Networks", logo: "https://upload.wikimedia.org/wikipedia/commons/7/79/Arista_Networks_logo.svg" },
    { name: "Ubiquiti Networks", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Ubiquiti_Networks_logo.svg" },
    
    // Software Vendors
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
    { name: "Adobe", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Adobe_Corporate_logo.svg" },
    { name: "VMware", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/VMware_logo.svg" },
    { name: "SAP", logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg" },
    { name: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Salesforce.com_logo.svg" },
    { name: "Oracle", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Oracle_Logo_Red_600x180.png" },
    { name: "ServiceNow", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/ServiceNow_logo.svg" },
    { name: "Atlassian", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Atlassian_logo.svg" },
    { name: "Slack", logo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png" },
    { name: "Tableau", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Tableau_Logo.svg" },
    
    // Networking Vendors
    { name: "Extreme Networks", logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/Extreme_Networks_logo.svg" },
    { name: "Netgear", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Netgear_logo.svg" },
    { name: "TP-Link", logo: "https://upload.wikimedia.org/wikipedia/commons/5/55/TP-Link_logo_2016.svg" },
    
    // DevOps and CI/CD Tools
    { name: "Jenkins", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Jenkins_logo.svg" },
    { name: "CircleCI", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Circleci-icon-logo.svg" },
    { name: "GitLab", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg" },
    { name: "Travis CI", logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/Travis_CI_Logo.png" },
    { name: "Bamboo (Atlassian)", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Bamboo_Logo.png" },
    { name: "Azure DevOps", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Azure_DevOps_Logo.svg" },
    { name: "GitHub Actions", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/GitHub_Actions_logo.svg" },
    { name: "Spinnaker", logo: "https://upload.wikimedia.org/wikipedia/commons/d/da/Spinnaker_logo.png" },
    
    // Database Providers
    { name: "Oracle Database", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Oracle_Logo_Red_600x180.png" },
    { name: "Microsoft SQL Server", logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Microsoft_SQL_Server_Logo.svg" },
    { name: "MySQL", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/MySQL_textlogo.svg" },
    { name: "PostgreSQL", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" },
    { name: "MongoDB", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" },
    { name: "Couchbase", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Couchbase_Logo.png" },
    { name: "Redis Labs", logo: "https://upload.wikimedia.org/wikipedia/en/6/6b/Redis_Logo.svg" },
    { name: "Snowflake", logo: "https://upload.wikimedia.org/wikipedia/en/4/44/Snowflake_Logo.svg" },
    { name: "MariaDB", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/MariaDB_Logo.png" },
    
    // Artificial Intelligence and Machine Learning
    { name: "NVIDIA", logo: "https://upload.wikimedia.org/wikipedia/en/0/0d/NVIDIA_logo.png" },
    { name: "Google AI", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Google_Artificial_Intelligence.png" },
    { name: "IBM Watson", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_Watson_Logo_2017.png" },
    { name: "Microsoft AI", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Microsoft_Azure_Logo.svg" },
    { name: "DataRobot", logo: "https://upload.wikimedia.org/wikipedia/en/f/f7/DataRobot_logo.png" },
    { name: "H2O.ai", logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/H2O.ai_Logo.png" },
    { name: "C3.ai", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/C3.ai_Logo.png" },
    { name: "OpenAI", logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/OpenAI_Logo.png" },
    { name: "SAS", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/SAS_logo.svg" },
    
    // Collaboration and Communication Tools
    { name: "Zoom", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Zoom_Communications_Logo.png" },
    { name: "Microsoft Teams", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Microsoft_Teams-Logo.svg" },
    { name: "Cisco Webex", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Webex-logo.png" },
    { name: "Google Meet", logo: "https://upload.wikimedia.org/wikipedia/commons/9/92/Google_Meet_Logo.png" },
    { name: "BlueJeans", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/BlueJeans_Network_Logo.png" },
    { name: "GoToMeeting", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3b/GoToMeeting_Logo.png" },
    
    // Monitoring and Analytics
    { name: "Splunk", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Splunk_logo.svg" },
    { name: "New Relic", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/New_Relic_Logo.png" },
    { name: "Dynatrace", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Dynatrace_logo.png" },
    { name: "Datadog", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Datadog_logo.svg" },
    { name: "Elastic (Elasticsearch)", logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Elastic_Logo.svg" },
    { name: "Prometheus", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Prometheus_Logo.svg" },
    { name: "Nagios", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Nagios-logo.svg" },
    { name: "Zabbix", logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/Zabbix_logo.png" },
    { name: "SolarWinds", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/SolarWinds_logo.png" },
    
    // Identity and Access Management
    { name: "Okta", logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Okta_logo.svg" },
    { name: "Duo Security", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Duo_Security_logo.svg" },
    { name: "Ping Identity", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Ping_Identity_logo.svg" },
    { name: "OneLogin", logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/OneLogin_logo.png" },
    { name: "Auth0", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Auth0_Logo.png" },
    { name: "Microsoft Azure Active Directory", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Microsoft_Azure_Logo.svg" },
    { name: "RSA Security", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/RSA_logo.png" },
    
    // Backup and Recovery
    { name: "Veeam", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Veeam_logo.svg" },
    { name: "Commvault", logo: "https://upload.wikimedia.org/wikipedia/commons/0/06/Commvault_logo.svg" },
    { name: "Veritas", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Veritas_Technologies_logo.svg" },
    { name: "Acronis", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Acronis_logo.svg" },
    { name: "Carbonite", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Carbonite_logo.svg" },
    { name: "Barracuda Networks", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Barracuda_Networks_Logo.svg" },
    { name: "Arcserve", logo: "https://upload.wikimedia.org/wikipedia/commons/7/70/Arcserve_logo.svg" },
    
    // Storage Solutions
    { name: "NetApp", logo: "https://upload.wikimedia.org/wikipedia/commons/6/66/NetApp_logo.svg" },
    { name: "Dell EMC", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg" },
    { name: "Hewlett Packard Enterprise (HPE)", logo: "https://upload.wikimedia.org/wikipedia/commons/6/66/HP_Logo_2012.svg" },
    { name: "Pure Storage", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Pure_Storage_logo.svg" },
    { name: "Hitachi Vantara", logo: "https://upload.wikimedia.org/wikipedia/commons/6/68/Hitachi_inspire_the_next_logo.svg" },
    { name: "IBM Storage", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/IBM_Cloud_logo.png" },
    { name: "Western Digital", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Western_Digital_logo.svg" },
    { name: "Seagate Technology", logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Seagate_Technology_logo.svg" },
    
    // Development Tools
    { name: "JetBrains (IntelliJ IDEA, PyCharm, etc.)", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9c/JetBrains_Logo.svg" },
    { name: "Eclipse Foundation", logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/Eclipse_Logo.svg" },
    { name: "Microsoft Visual Studio", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Visual_Studio_Icon_2022.svg" },
    { name: "GitHub", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" },
    { name: "Bitbucket", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Bitbucket-logo.png" },
    { name: "Postman", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Postman-logo.png" },
    
    // E-commerce Platforms
    { name: "Shopify", logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Shopify_logo_2018_black.svg" },
    { name: "Magento", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Magento_Logo.svg" },
    { name: "WooCommerce", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/WooCommerce_logo.svg" },
    { name: "BigCommerce", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/BigCommerce_logo.png" },
    { name: "Salesforce Commerce Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Salesforce.com_logo.svg" },
    { name: "SAP Commerce Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg" },
    
    // Customer Relationship Management (CRM)
    { name: "Microsoft Dynamics 365", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Microsoft_Dynamics_365_logo.svg" },
    { name: "HubSpot", logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/HubSpot_Logo.png" },
    { name: "Zoho CRM", logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/Zoho_Logo.svg" },
    { name: "SAP CRM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg" },
    { name: "Pipedrive", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Pipedrive_Logo.png" },
    
    // Learning Management Systems (LMS)
    { name: "Moodle", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Moodle_Logo.png" },
    { name: "Blackboard", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Blackboard_Inc_logo.svg" },
    { name: "Canvas", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Canvas_Logo.png" },
    { name: "D2L Brightspace", logo: "https://upload.wikimedia.org/wikipedia/commons/9/97/D2L_Brightspace_Logo.png" },
    { name: "Google Classroom", logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png" },
    { name: "Adobe Captivate Prime", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Adobe_Corporate_logo.svg" },
    { name: "SAP Litmos", logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg" },
    
    // Financial Services and Payment Processing
    { name: "PayPal", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
    { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Stripe_logo%2C_revised_2016.svg" },
    { name: "Square", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Square%2C_Inc._logo.svg" },
    { name: "Adyen", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Adyen_logo.svg" },
    { name: "Authorize.Net", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Authorize.Net_logo.svg" },
    { name: "Worldpay", logo: "https://upload.wikimedia.org/wikipedia/commons/7/79/Worldpay_Logo.svg" },
    { name: "Klarna", logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Klarna_Logo.svg" },
    
    // Virtualization
    { name: "Microsoft Hyper-V", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Microsoft_Hyper-V_Logo.png" },
    { name: "Oracle VM", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Oracle_Logo_Red_600x180.png" },
    { name: "Citrix", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Citrix_Logo.svg" },
    { name: "Red Hat Virtualization", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Red_Hat_logo.svg" },
    
    // Containerization and Orchestration
    { name: "Docker", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.png" },
    { name: "Kubernetes", logo: "https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg" },
    { name: "Red Hat OpenShift", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Red_Hat_OpenShift_Logo.svg" },
    { name: "Rancher", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Rancher_Logo.svg" },
    { name: "VMware Tanzu", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/VMware_logo.svg" },
    
    // Blockchain Platforms
    { name: "IBM Blockchain", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
    { name: "Microsoft Azure Blockchain", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Microsoft_Azure_Logo.svg" },
    { name: "Hyperledger", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Hyperledger_logo.png" },
    { name: "Ethereum", logo: "https://upload.wikimedia.org/wikipedia/commons/6/63/Ethereum_logo_2014.svg" },
    { name: "R3 Corda", logo: "https://upload.wikimedia.org/wikipedia/commons/9/97/R3_Corda_Logo.png" },
    
    // Other Potential Partners
    { name: "Red Hat", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Red_Hat_logo.svg" },
    { name: "Broadcom", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Broadcom_Logo.svg" },
    { name: "ZScaler", logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/Zscaler_Logo.svg" },
    { name: "Proofpoint", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Proofpoint_logo.svg" }
];

// Define an array of partners with their categories and image URLs
const partners = [
    { name: "Amazon Web Services (AWS)", logo: "https://d1.awsstatic.com/r2023/images/logos/aws_logo_smile_1200x630.png" },
    { name: "Microsoft Azure", logo: "https://azurecomcdn.azureedge.net/cvt-9b5d4e8de7a0dfb2bcd1588c91ba648ecee223bfae3e7c3ff7d3b7697ebd4edb/images/page/home/header/logo-azure.svg" },
    { name: "Google Cloud Platform (GCP)", logo: "https://cloud.google.com/images/social-icon-google-cloud-1200-630.png" },
    { name: "IBM Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/IBM_Cloud_logo.png" },
    { name: "Oracle Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Oracle_Logo_Red_600x180.png" },
    { name: "DigitalOcean", logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/DigitalOcean_logo.png" },
    { name: "McAfee", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3b/McAfee_logo.svg" },
    { name: "Symantec", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Symantec_logo.svg" },
    { name: "Fortinet", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Fortinet_logo.svg" },
    { name: "Palo Alto Networks", logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Palo_Alto_Networks_Logo.png" },
    // Add more partners here
];

const importantPartners = [
    "Amazon Web Services (AWS)",
    "Microsoft Azure",
    "Google Cloud Platform (GCP)",
    "IBM Cloud",
    "Oracle Cloud"
];

// Function to filter partners based on search input
function filterPartners() {
    const input = document.getElementById('partnerSearch');
    const filter = input.value.toLowerCase();
    const nodes = document.getElementsByClassName('partner-item');

    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].innerText.toLowerCase().includes(filter)) {
            nodes[i].style.display = "block";
        } else {
            nodes[i].style.display = "none";
        }
    }
}

// Function to initialize the partners list
function initializePartners() {
    const partnersList = document.getElementById('partnersList');
    partnersList.innerHTML = '';

    partners.forEach(partner => {
        const isImportant = importantPartners.includes(partner.name);
        const partnerItem = document.createElement('div');
        partnerItem.className = 'partner-item';
        partnerItem.style.display = isImportant ? 'block' : 'none';
        partnerItem.innerHTML = `<img src="${partner.logo}" alt="${partner.name} Logo" onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Placeholder_Icon.svg/2048px-Placeholder_Icon.svg.png';"><p>${partner.name}</p>`;
        partnersList.appendChild(partnerItem);
    });
}

// Initialize partners on page load
document.addEventListener('DOMContentLoaded', initializePartners);

