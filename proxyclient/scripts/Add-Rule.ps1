[CmdletBinding()]
param(
  [string]$ruleList
)
# Get the ID and security principal of the current user account
$myWindowsID=[System.Security.Principal.WindowsIdentity]::GetCurrent()
$myWindowsPrincipal=new-object System.Security.Principal.WindowsPrincipal($myWindowsID)

# Get the security principal for the Administrator role
$adminRole=[System.Security.Principal.WindowsBuiltInRole]::Administrator

# Check to see if we are currently running "as Administrator"
if ($myWindowsPrincipal.IsInRole($adminRole))
   {
   # We are running "as Administrator" - so change the title and background color to indicate this
   $Host.UI.RawUI.WindowTitle = $myInvocation.MyCommand.Definition + "(Elevated)"
   $Host.UI.RawUI.BackgroundColor = "DarkBlue"
   Write-Host $ruleList
   }
else
   {
   # Get the command name
   $CommandName = $PSCmdlet.MyInvocation.InvocationName;
   # Get the list of parameters for the command
   $ParameterList = (Get-Command -Name $CommandName).Parameters;

   # Copy the -ruleList argument
   foreach ($Parameter in $ParameterList) {
       $a = Get-Variable -Name $Parameter.Values.Name -ErrorAction SilentlyContinue;
   }
   $rs = ($a | select -exp "Value")
   $argument = "-ruleList $rs"

   # Get the full path of the script
   $sn = $myInvocation.Mycommand.Definition

   # Start the new process as administrator
   Start-Process powershell -ArgumentList "$sn -ruleList $rs" -Verb RunAs

   # Exit from the current, unelevated, process
   exit
   }

Function Add-Rule {
    param ([string]$name, [string]$direction, [string]$remoteAddress, [string]$remotePort, [string]$localAddress, [string]$localPort, [string]$protocol, [string]$action)
    $command = ""
    If (![string]::IsNullOrEmpty($name)) {
        $command += "New-NetFirewallRule -DisplayName $name "
        If (!(($remoteAddress -eq "0.0.0.0") -or ($remoteAddress -eq "*"))){
            $command += "-RemoteAddress $remoteAddress "
        }
        If (!(($localAddress -eq "0.0.0.0") -or ($localAddress -eq "*"))){
            $command += "-LocalAddress $localAddress "
        }
        If (!([string]::IsNullOrEmpty($protocol)) -and !($protocol -eq "*")){
            $command += "-Protocol $protocol "
            If (!($remotePort -eq "*")){
                $command += "-RemotePort $remotePort "
            }
            If(!($localPort -eq "*")){
                $command += "-LocalPort $localPort "
            }
        }
        If (($direction -eq "Inbound") -or ($direction -eq "Outbound")){
            $command += "-Direction $direction "
        }
        If (($action -eq "Allow") -or ($action -eq "Block")){
            $command += "-Action $action "
        }
    }
    Write-host $command
    If (!(($direction -eq "Inbound") -and ($action -eq "Block"))){
      Invoke-Expression $command
    }
}

Set-NetFirewallProfile -All -DefaultInboundAction Block -DefaultOutboundAction Allow
Remove-NetFirewallRule -All
Write-Host $ruleList
$rulesObj = ConvertFrom-Json -InputObject $ruleList
ForEach ($rule in $rulesObj) {
  $args = "& Add-Rule -Name $($rule.name) -Protocol $($rule.protocol) -Action "
  If ($($rule.allow)) {
    $args += "Allow "
  } Else {
    $args += "Block "
  }
  If ($($rule.direction) -eq "incoming") {
    $args += "-Direction Inbound -RemoteAddress $($rule.sourceip) -RemotePort $($rule.sourceport) -LocalAddress $($rule.destip) -LocalPort $($rule.destport)"
  } Else {
    $args += "-Direction Outbound -RemoteAddress $($rule.destip) -RemotePort $($rule.destport) -LocalAddress $($rule.sourceip) -LocalPort $($rule.sourceport)"
  }
  Invoke-Expression $args
}
