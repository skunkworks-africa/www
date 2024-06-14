import os
import shutil
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Define the base directory for partners
base_dir = "partners"

# Define the assets directory to search for existing logos
assets_dir = "assets"

# Define additional directories to be referenced
additional_dirs = [
    "backend",
    "css",
    "js",
    "docs"
]

# Define partners and categories
partners = {
    "Cloud Service Providers": [
        "Amazon Web Services (AWS)", "Microsoft Azure", "Google Cloud Platform (GCP)", "IBM Cloud",
        "Oracle Cloud", "Alibaba Cloud", "DigitalOcean", "Linode"
    ],
    "Cybersecurity Providers": [
        "McAfee", "Symantec", "Trend Micro", "Fortinet", "Palo Alto Networks",
        "Checkpoint", "CrowdStrike", "FireEye", "Kaspersky", "Sophos"
    ],
    "Hardware Vendors": [
        "Dell", "HP (Hewlett-Packard)", "Lenovo", "Intel", "AMD (Advanced Micro Devices)",
        "Cisco", "Juniper Networks", "Arista Networks", "Ubiquiti Networks"
    ],
    "Software Vendors": [
        "Microsoft", "Adobe", "VMware", "SAP", "Salesforce",
        "Oracle", "ServiceNow", "Atlassian", "Slack", "Tableau"
    ],
    "Networking Vendors": [
        "Cisco", "Juniper Networks", "Arista Networks", "Ubiquiti Networks",
        "Extreme Networks", "Netgear", "TP-Link"
    ],
    "DevOps and CI/CD Tools": [
        "Jenkins", "CircleCI", "GitLab", "Travis CI", "Bamboo (Atlassian)",
        "Azure DevOps", "GitHub Actions", "Spinnaker"
    ],
    "Database Providers": [
        "Oracle Database", "Microsoft SQL Server", "MySQL", "PostgreSQL",
        "MongoDB", "Couchbase", "Redis Labs", "Snowflake", "MariaDB"
    ],
    "Artificial Intelligence and Machine Learning": [
        "NVIDIA", "Google AI", "IBM Watson", "Microsoft AI",
        "DataRobot", "H2O.ai", "C3.ai", "OpenAI", "SAS"
    ],
    "Collaboration and Communication Tools": [
        "Zoom", "Microsoft Teams", "Slack", "Cisco Webex",
        "Google Meet", "BlueJeans", "GoToMeeting"
    ],
    "Monitoring and Analytics": [
        "Splunk", "New Relic", "Dynatrace", "Datadog",
        "Elastic (Elasticsearch)", "Prometheus", "Nagios", "Zabbix", "SolarWinds"
    ],
    "Identity and Access Management": [
        "Okta", "Duo Security", "Ping Identity", "OneLogin",
        "Auth0", "Microsoft Azure Active Directory", "RSA Security"
    ],
    "Backup and Recovery": [
        "Veeam", "Commvault", "Veritas", "Acronis",
        "Carbonite", "Barracuda Networks", "Arcserve"
    ],
    "Storage Solutions": [
        "NetApp", "Dell EMC", "Hewlett Packard Enterprise (HPE)",
        "Pure Storage", "Hitachi Vantara", "IBM Storage", "Western Digital", "Seagate Technology"
    ],
    "Development Tools": [
        "JetBrains (IntelliJ IDEA, PyCharm, etc.)", "Eclipse Foundation", "Microsoft Visual Studio",
        "GitHub", "GitLab", "Bitbucket", "Postman"
    ],
    "E-commerce Platforms": [
        "Shopify", "Magento", "WooCommerce", "BigCommerce",
        "Salesforce Commerce Cloud", "SAP Commerce Cloud"
    ],
    "Customer Relationship Management (CRM)": [
        "Salesforce", "Microsoft Dynamics 365", "HubSpot",
        "Zoho CRM", "Oracle CRM", "SAP CRM", "Pipedrive"
    ],
    "Learning Management Systems (LMS)": [
        "Moodle", "Blackboard", "Canvas", "D2L Brightspace",
        "Google Classroom", "Adobe Captivate Prime", "SAP Litmos"
    ],
    "Financial Services and Payment Processing": [
        "PayPal", "Stripe", "Square", "Adyen",
        "Authorize.Net", "Worldpay", "Klarna"
    ],
    "Virtualization": [
        "VMware", "Microsoft Hyper-V", "Oracle VM",
        "Citrix", "Red Hat Virtualization"
    ],
    "Containerization and Orchestration": [
        "Docker", "Kubernetes", "Red Hat OpenShift",
        "Rancher", "VMware Tanzu"
    ],
    "Blockchain Platforms": [
        "IBM Blockchain", "Microsoft Azure Blockchain",
        "Hyperledger", "Ethereum", "R3 Corda"
    ],
    "Other Potential Partners": [
        "Red Hat", "Broadcom", "ServiceNow",
        "ZScaler", "Proofpoint"
    ]
}

# Function to search for logo in local assets directory and additional directories
def find_local_logo(partner_name):
    search_dirs = [assets_dir] + additional_dirs
    for search_dir in search_dirs:
        for root, dirs, files in os.walk(search_dir):
            for file in files:
                if partner_name.lower().replace(" ", "_") in file.lower():
                    return os.path.join(root, file)
    return None

# Function to search the internet for a logo
def search_internet_logo(partner_name):
    search_engines = [
        ("bing", f"https://www.bing.com/images/search?q={partner_name}+logo"),
        ("google", f"https://www.google.com/search?tbm=isch&q={partner_name}+logo"),
        ("wikipedia", f"https://en.wikipedia.org/wiki/{partner_name.replace(' ', '_')}"),
        ("github", f"https://github.com/search?q={partner_name}+logo")
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    for name, search_url in search_engines:
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        images = soup.find_all('img')

        for img in images:
            img_url = img.get('src')
            if not img_url.startswith('http'):
                img_url = urljoin(search_url, img_url)
            if img_url and 'logo' in img_url.lower():
                return img_url

    return None

# Function to download logo from internet
def download_logo(partner_name, url, save_path):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)
        return save_path
    return None

# Function to create directories and move HTML files
def setup_partner_directories(base_dir, partners):
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    for category, partner_list in partners.items():
        category_dir = os.path.join(base_dir, category.replace(" ", "_"))
        if not os.path.exists(category_dir):
            os.makedirs(category_dir)

        for partner in partner_list:
            partner_dir = os.path.join(category_dir, partner.replace(" ", "_").replace("(", "").replace(")", "").replace(".", ""))
            if not os.path.exists(partner_dir):
                os.makedirs(partner_dir)

            partner_html = f"{partner.replace(' ', '_').replace('(', '').replace(')', '').replace('.', '')}.html"
            partner_html_path = os.path.join(os.getcwd(), partner_html)

            if os.path.exists(partner_html_path):
                shutil.move(partner_html_path, os.path.join(partner_dir, partner_html))

            # Check for existing logo
            logo_path = find_local_logo(partner)
            if not logo_path:
                # Search and download logo from internet
                logo_url = search_internet_logo(partner)
                if logo_url:
                    logo_path = os.path.join(partner_dir, f"{partner.replace(' ', '_').replace('(', '').replace(')', '').replace('.', '')}_logo.png")
                    download_logo(partner, logo_url, logo_path)

            # Create landing page for partner
            with open(os.path.join(partner_dir, "index.html"), "w") as f:
                f.write(f"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>{partner}</title>
                    <link rel="stylesheet" href="../../css/header.css">
                    <link rel="stylesheet" href="../../css/footer.css">
                    <link rel="stylesheet" href="../../css/main.css">
                    <link rel="stylesheet" href="../../css/forms.css">
                    <link rel="stylesheet" href="../../css/sidebar.css">
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                            color: #333;
                        }}
                        header {{
                            background-color: #333;
                            color: #fff;
                            padding: 10px 0;
                            text-align: center;
                        }}
                        nav ul {{
                            list-style-type: none;
                            padding: 0;
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            background-color: #444;
                        }}
                        nav ul li {{
                            margin: 0 15px;
                            position: relative;
                        }}
                        nav ul li a {{
                            color: #fff;
                            text-decoration: none;
                            display: block;
                            padding: 10px 15px;
                        }}
                        nav ul li ul {{
                            display: none;
                            position: absolute;
                            top: 100%;
                            left: 0;
                            background-color: #444;
                            padding: 0;
                            margin: 0;
                            list-style-type: none;
                            z-index: 1000;
                        }}
                        nav ul li:hover ul {{
                            display: block;
                        }}
                        nav ul li ul li a {{
                            padding: 10px 20px;
                        }}
                        footer {{
                            background-color: #333;
                            color: #fff;
                            padding: 20px 0;
                            text-align: center;
                            position: fixed;
                            width: 100%;
                            bottom: 0;
                        }}
                        main {{
                            padding: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                        }}
                        main img {{
                            max-width: 100%;
                            height: auto;
                            display: block;
                            margin: 20px 0;
                        }}
                        .services {{
                            margin-top: 30px;
                        }}
                        .services h3 {{
                            margin-top: 0;
                        }}
                        .services ul {{
                            list-style-type: none;
                            padding: 0;
                        }}
                        .services ul li {{
                            background-color: #eee;
                            margin: 5px 0;
                            padding: 10px;
                            border-radius: 5px;
                        }}
                    </style>
                </head>
                <body>
                    <header>
                        <img src="https://raw.githubusercontent.com/skunkworksza/www/deecfe157af43d2fcdadb4196c9c8b5e3c68660d/assets/icons/bee.svg" alt="Bee Logo">
                        <h1>{partner}</h1>
                    </header>
                    <nav>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/partners">Partners</a></li>
                            <li><a href="/services">Services</a></li>
                            <li><a href="/about">About</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </nav>
                    <main>
                        <h2>Welcome to the {partner} page</h2>
                        <p>This is the landing page for {partner}.</p>
                        <img src="{logo_path}" alt="{partner} Logo">
                        <div class="services">
                            <h3>Training, Products, and Services</h3>
                            <ul>
                                <li><strong>Training:</strong> Comprehensive training programs tailored to {partner} technologies.</li>
                                <li><strong>Products:</strong> Access to {partner} products with expert guidance and support.</li>
                                <li><strong>Services:</strong> Customized solutions and services to enhance your business operations.</li>
                            </ul>
                        </div>
                    </main>
                    <footer>
                        <p>&copy; 2024 Skunkworks. All rights reserved.</p>
                    </footer>
                </body>
                </html>
                """)

# Initialize partners directory
setup_partner_directories(base_dir, partners)
