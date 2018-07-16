param(
  [Parameter(Mandatory=$true)][string]$ruleList
)

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
    Invoke-Expression $command
}

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
