/* Pandemonium C boundary: the one flat interface to the core. */
#ifndef UM_H
#define UM_H
#ifdef __cplusplus
extern "C" {
#endif
double um_d4(void);
void   um_normalise(int n,const double*x,double*y);
void   um_zones(int n,const double*x,double*mu,double*sd,int*zone);
void   um_collapse_h(int n,int m,const double*a,double*h);
double um_zzero(int n,const double*h);
double um_cycloid(double z0,double z1,double s);
/* Hinge: validated entry. Returns 0 ok, -1 rejected (NaN/inf/empty). */
int um_hinge_state(int n,int m,const double*raw,double*zzero,int*zones);
#ifdef __cplusplus
}
#endif
#endif
