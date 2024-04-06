document.addEventListener("DOMContentLoaded", function () {
    const otpInputs = document.querySelectorAll('.otp');

    otpInputs.forEach((input, index) => {
        input.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                const nextIndex = index + 1;
                if (nextIndex < otpInputs.length) {
                    otpInputs[nextIndex].focus();
                }
            }
        });
    });
});