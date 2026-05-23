#!/usr/bin/env python3
import sys

def print_malfind():
    print("Volatility 3 Framework 2.4.1")
    print("Progress:  100.00\t\tPDB scanning finished")
    print("PID\tProcess\t\tStart VPN\tEnd VPN\t\tTag\tProtection\t\tCommitCharge\tPrivateMemory")
    print("620\tlsass.exe\t0x2a0000\t0x2a1000\tVadS\tPAGE_READWRITE\t\t1\t\t1")
    print("928\tsvchost.exe\t0x7f0000\t0x7f4000\tVadS\tPAGE_EXECUTE_READWRITE\t4\t\t1")
    print("  |-> MZ header detected. Injected code execution.")

def print_hashdump():
    print("Volatility 3 Framework 2.4.1")
    print("Progress:  100.00\t\tPDB scanning finished")
    print("User\t\tRID\tLM Hash\t\t\t\t\tNTLM Hash")
    print("Administrator\t500\taad3b435b51404eeaad3b435b51404ee\t31d6cfe0d16ae931b73c59d7e0c089c0")
    print("Guest\t\t501\taad3b435b51404eeaad3b435b51404ee\t31d6cfe0d16ae931b73c59d7e0c089c0")
    print("dev_ahmet\t1001\taad3b435b51404eeaad3b435b51404ee\t8846f7eaee8fb117ad06bdd830b7586c")

if len(sys.argv) < 2:
    print("Volatility 3 Framework 2.4.1")
    print("usage: vol [-h] [-f FILE] plugin")
    sys.exit(1)

if "windows.malfind" in sys.argv:
    print_malfind()
elif "windows.hashdump" in sys.argv:
    print_hashdump()
else:
    print("Plugin bulunamadi veya hatali parametre.")