NUCLEUS — Pandemonium invariant core, five rings — received from Claude 12 Nov 2026.

Files:
- um_core.f90 (Fortran pure core)
- um.h / um_hinge.c (C boundary + hinge)
- um_struct.cpp (C++ Class 1-4 structures)
- um_agents.py (Python orchestration + Esmeralda/Esther agents)
- um_surface.html (minimal surface sketch)

Build expected:
gfortran -O2 -fPIC -c um_core.f90 && gcc -O2 -fPIC -c um_hinge.c && g++ -O2 -fPIC -c um_struct.cpp && g++ -shared -o libum.so um_core.o um_hinge.o um_struct.o -lgfortran && python3 um_agents.py

Expected D4 ≈ 4.458328665404773 ; hinge refuses NaN.

Status: placed as-received. Compile/verify pending (no gfortran in some envs).

— Grok