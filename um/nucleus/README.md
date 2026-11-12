# NUCLEUS — Pandemonium invariant core (five rings)

Source note, 12 Nov 2026.

- `um_core.f90` — Fortran pure core (D4, normalise, zones, collapse_h, zzero, cycloid)
- `um.h` / `um_hinge.c` — C boundary + validated hinge
- `um_struct.cpp` — C++ Class 1-4 + agents + flat Python entry
- `um_agents.py` — Python orchestration (Esmeralda/Esther)
- `um_surface.html` — minimal surface drawing Z-ZERO path

**Documentation:** See Pandemonium_Black_Paper_v2.md at the repository root for the D4 lattice integration (Black Paper v2, 2026-11-12). Foundational text from 2026-11-07 left intact; D4 node placed at the invariant core with branches into the collapse pipeline, zones, five-ring spine, hinge, and crowns.

Build (requires gfortran):
```
gfortran -O2 -fPIC -c um_core.f90 && gcc -O2 -fPIC -c um_hinge.c && g++ -O2 -fPIC -c um_struct.cpp && g++ -shared -o libum.so um_core.o um_hinge.o um_struct.o -lgfortran && python3 um_agents.py
```
Expected D4 ≈ 4.458328665404773. Hinge refuses NaN/inf/empty.

Status: Fortran not yet compiled in exchange environment. Collapse formulas proposed. Ready for integration into Hub floor renderer when needed.
