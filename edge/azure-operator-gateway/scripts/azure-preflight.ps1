# Read-only bootstrap preflight. Requires Azure CLI and an authenticated administrator session.
# No resource creation, RBAC modification, or billing changes.
$ErrorActionPreference = 'Stop'
$TenantId = '338a8916-80d9-467c-a94a-7f61d04ef7d5'
$SubscriptionId = '9f19b7fc-4a54-4c11-8cea-239dcf3392a4'
$ResourceGroup = 'rg-skunkworks-automation-prod'
Write-Host 'Skunkworks Azure Operator preflight — read-only' -ForegroundColor Cyan
if (-not (Get-Command az -ErrorAction SilentlyContinue)) { throw 'Azure CLI not installed: https://learn.microsoft.com/cli/azure/install-azure-cli' }
az account show --output none 2>$null
if ($LASTEXITCODE -ne 0) { az login --tenant $TenantId; if ($LASTEXITCODE -ne 0) { throw 'Login failed' } }
az account set --subscription $SubscriptionId
if ($LASTEXITCODE -ne 0) { throw 'Subscription not accessible. Check the directory and subscription RBAC.' }
$account = az account show --query '{subscription:id,tenant:tenantId,name:name,state:state}' -o json | ConvertFrom-Json
if ($account.tenant -ne $TenantId) { throw "Tenant mismatch: subscription belongs to $($account.tenant), expected $TenantId. STOP; no deployments." }
$account | Format-List
Write-Host 'Current identity:' -ForegroundColor Cyan
az ad signed-in-user show --query '{id:id,userPrincipalName:userPrincipalName}' -o json
Write-Host 'Provider registrations (inspection only):' -ForegroundColor Cyan
az provider list --query "[?namespace=='Microsoft.Web' || namespace=='Microsoft.Storage' || namespace=='Microsoft.Insights'].{namespace:namespace,state:registrationState}" -o table
Write-Host 'Candidate resource group (inspection only):' -ForegroundColor Cyan
az group show --name $ResourceGroup --query '{name:name,location:location,id:id}' -o json 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host 'Resource group does not exist; creation requires separate approval.' }
Write-Host 'Existing Function Apps:' -ForegroundColor Cyan
az functionapp list --query "[].{name:name,resourceGroup:resourceGroup,location:location,state:state}" -o table
Write-Host 'Preflight completed. NO changes made.' -ForegroundColor Green
