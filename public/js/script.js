const scroll = new LocomotiveScroll({
    el: document.querySelector('#main'),
    smooth: true
});

gsap.from("#main",{
    y:30,
    opacity:0,
    delay:0.2,
    duration:0.8,
    stagger:0.6
});

function myFunction(x) {
    // x.classList.toggle("change");
    var sidenav = document.getElementById("sidenav");
  sidenav.style.width === "250px" ? sidenav.style.width = "0" : sidenav.style.width = "250px";
    // document.getElementById("sidenav").style.width = "250px";
    // document.getElementById("sidenav").style.width = "0";
}

function closeNav() {
    document.getElementById("sidenav").style.width = "0";
  }

function signUp() {
    window.location.href = '/signup'
}

function report() {
    window.location.href = '/report'
}
