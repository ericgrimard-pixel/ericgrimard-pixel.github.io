! Pandemonium invariant core. Pure: no I/O, no global state.
module um_core
  use iso_c_binding
  implicit none
  real(c_double), parameter :: E_=2.718281828459045d0, PI_=3.141592653589793d0
  real(c_double), parameter :: PHI_=1.618033988749895d0
contains
  ! D4 pipeline constant sqrt(e^2+pi^2+phi^2)
  pure function um_d4() result(r) bind(C,name="um_d4")
    real(c_double) :: r
    r = sqrt(E_**2+PI_**2+PHI_**2)
  end function
  ! Normalise a column to [-1,1] (min-max)
  pure subroutine um_normalise(n,x,y) bind(C,name="um_normalise")
    integer(c_int), value :: n
    real(c_double), intent(in) :: x(n)
    real(c_double), intent(out) :: y(n)
    real(c_double) :: lo,hi
    lo=minval(x); hi=maxval(x)
    if (hi>lo) then
      y = 2d0*(x-lo)/(hi-lo)-1d0
    else
      y = 0d0
    end if
  end subroutine
  ! Gaussian fit (mean, sd) and five-zone cut at 20/40/60/80% of N(mu,sd)
  ! zone: 1=Omega 2=phi- 3=Sigma 4=phi+ 5=Alpha
  pure subroutine um_zones(n,x,mu,sd,zone) bind(C,name="um_zones")
    integer(c_int), value :: n
    real(c_double), intent(in) :: x(n)
    real(c_double), intent(out) :: mu,sd
    integer(c_int), intent(out) :: zone(n)
    real(c_double), parameter :: q(4)=[-0.8416212335729143d0,-0.2533471031357997d0, &
                                       0.2533471031357997d0, 0.8416212335729143d0]
    integer :: i,k
    mu=sum(x)/n
    sd=sqrt(max(sum((x-mu)**2)/max(n-1,1),1d-300))
    do i=1,n
      zone(i)=1
      do k=1,4
        if (x(i) >= mu+q(k)*sd) zone(i)=k+1
      end do
    end do
  end subroutine
  ! Horizontal collapse: per point, D4-style norm across m attributes / sqrt(m)
  pure subroutine um_collapse_h(n,m,a,h) bind(C,name="um_collapse_h")
    integer(c_int), value :: n,m
    real(c_double), intent(in) :: a(n,m)
    real(c_double), intent(out) :: h(n)
    h = sqrt(sum(a**2,dim=2)/m)
  end subroutine
  ! Vertical collapse: population mean of h  -> Z-ZERO for one state
  pure function um_zzero(n,h) result(z) bind(C,name="um_zzero")
    integer(c_int), value :: n
    real(c_double), intent(in) :: h(n)
    real(c_double) :: z
    z=sum(h)/n
  end function
  ! Transversal: cycloidal transition T0->T1 at s in [0,1]
  pure function um_cycloid(z0,z1,s) result(z) bind(C,name="um_cycloid")
    real(c_double), value :: z0,z1,s
    real(c_double) :: z,t
    t=PI_*s
    z = z0+(z1-z0)*(t-sin(t))/PI_
  end function
end module
