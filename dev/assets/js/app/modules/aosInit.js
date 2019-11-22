export function aosInit() {

    AOS.init( {
        startEvent: 'DOMContentLoaded',
        debounceDelay: 50,
        throttleDelay: 99,
        ease: 'ease-in-out',
        delay: 50
    });

}