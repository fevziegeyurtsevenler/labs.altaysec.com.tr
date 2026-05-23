#!/usr/bin/env python3
import sys

def print_info():
    print("Volatility 3 Framework 2.4.1")
    print("Progress:  100.00\t\tPDB scanning finished")
    print("Variable\tValue")
    print("Kernel Base\t0x82845000")
    print("DTB\t\t0x185000")
    print("Is64Bit\t\tFalse")
    print("IsPAE\t\tTrue")
    print("NtSystemRoot\tC:\\Windows")
    print("NtProductType\tNtProductWinNt")
    print("OS\t\tWindows 7")

def print_pslist():
    print("Volatility 3 Framework 2.4.1")
    print("Progress:  100.00\t\tPDB scanning finished")
    print("PID\tPPID\tImageFileName\tOffset(V)\tThreads\tHandles\tSessionId")
    print("4\t0\tSystem\t\t0x85300020\t85\t468\tN/A")
    print("368\t4\tsmss.exe\t0x86ab9770\t2\t29\tN/A")
    print("464\t368\tcsrss.exe\t0x8746ba08\t9\t424\t0")
    print("508\t464\twininit.exe\t0x874e47a8\t3\t75\t0")
    print("600\t508\tservices.exe\t0x874fe900\t6\t186\t0")
    print("620\t508\tlsass.exe\t0x87508030\t3\t341\t0")
    print("1824\t600\tnc.exe\t\t0x87592410\t1\t112\t0")

if len(sys.argv) < 2:
    print("Volatility 3 Framework 2.4.1")
    print("usage: vol [-h] [-f FILE] plugin")
    sys.exit(1)

if "windows.info" in sys.argv:
    print_info()
elif "windows.pslist" in sys.argv:
    print_pslist()
else:
    print("Plugin bulunamadi veya hatali parametre.")