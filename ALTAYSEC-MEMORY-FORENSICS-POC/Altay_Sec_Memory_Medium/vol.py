#!/usr/bin/env python3
import sys

def print_netstat():
    print("Volatility 3 Framework 2.4.1")
    print("Progress:  100.00\t\tPDB scanning finished")
    print("Offset\tProto\tLocalAddr\tLocalPort\tForeignAddr\tForeignPort\tState\tPID\tOwner\tCreated")
    print("0x86754\tTCPv4\t192.168.1.10\t49152\t\t104.18.32.47\t443\t\tESTABLISHED\t464\tcsrss.exe\tN/A")
    print("0x89912\tTCPv4\t192.168.1.10\t49153\t\t198.51.100.88\t4444\t\tESTABLISHED\t31337\tupdater.exe\tN/A")

def print_psxview():
    print("Volatility 3 Framework 2.4.1")
    print("Progress:  100.00\t\tPDB scanning finished")
    print("Offset(V)\tName\tPID\tpslist\tpsscan\tthrdproc\tpspcid\tcsrss\tsession\tdesktop\tExitTime")
    print("0x85300020\tSystem\t4\tTrue\tTrue\tTrue\tTrue\tFalse\tFalse\tFalse\tN/A")
    print("0x8746ba08\tcsrss.exe\t464\tTrue\tTrue\tTrue\tTrue\tTrue\tTrue\tTrue\tN/A")
    print("0x87592410\texplorer.exe\t2048\tTrue\tTrue\tTrue\tTrue\tTrue\tTrue\tTrue\tN/A")
    print("0x88942110\tupdater.exe\t31337\tFalse\tTrue\tTrue\tTrue\tFalse\tFalse\tFalse\tN/A")

def print_pstree():
    print("Volatility 3 Framework 2.4.1")
    print("Progress:  100.00\t\tPDB scanning finished")
    print("PID\tPPID\tImageFileName\tOffset(V)\tThreads\tHandles\tSessionId\tWow64\tCreateTime\tExitTime")
    print("2048\t1900\texplorer.exe\t0x87592410\t45\t1200\t1\tFalse\t2026-05-13 08:12:00\tN/A")
    print(" * 31337\t2048\tupdater.exe\t0x88942110\t1\t112\t1\tFalse\t2026-05-13 09:45:22\tN/A")

if len(sys.argv) < 2:
    print("Volatility 3 Framework 2.4.1")
    print("usage: vol [-h] [-f FILE] plugin")
    sys.exit(1)

if "windows.netstat" in sys.argv:
    print_netstat()
elif "windows.psxview" in sys.argv:
    print_psxview()
elif "windows.pstree" in sys.argv:
    print_pstree()
else:
    print("Plugin bulunamadi veya hatali parametre.")