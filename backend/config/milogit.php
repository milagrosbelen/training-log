<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Emails del coach
    |--------------------------------------------------------------------------
    |
    | Solo estas cuentas pueden crear o modificar planes.
    | El registro público siempre crea alumnas (role = client).
    | Separá varios emails con coma.
    |
    */
    'coach_emails' => env('COACH_EMAILS', env('COACH_EMAIL', '')),
];
