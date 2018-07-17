[CmdletBinding()]
param (
      [string] $Bar = 'test'
    , [string] $Baz
    , [string] $Asdf
)
# Get the command name
$CommandName = $PSCmdlet.MyInvocation.InvocationName;
# Get the list of parameters for the command
$ParameterList = (Get-Command -Name $CommandName).Parameters;

# Grab each parameter value, using Get-Variable
foreach ($Parameter in $ParameterList) {
    $a = Get-Variable -Name $Parameter.Values.Name -ErrorAction SilentlyContinue;
    #Get-Variable -Name $ParameterList;
}
Write-Host ($a | select -exp "value")
