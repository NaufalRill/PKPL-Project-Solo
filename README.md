### Requirements

- PHP v8.2+
- Composer
- PostgreSQL v15+
- Node JS v22+

### Installation

1. Menjalankan `composer install`
2. Menjalankan `npm install --force`
3. Copy `.env.example` file ke `.env`
4. Mengisi variabel `DB` di `.env`
5. Menjalankan `php artisan key:generate`
6. Menjalankan db migration `php artisan migrate:fresh --seed`

### Running

1. Menjalankan `npm run dev`
2. Menjalankan `php artisan serve`
3. Menjalankan website melalui link yang ditampilkan di terminal (biasanya 127.0.0.1:8000)

### Default Account

Admin:
    - email: admin@admin.com
    - password: Admin.23

### Preview
<img width="2880" height="1385" alt="chrome_RCUncKAxB4" src="https://github.com/user-attachments/assets/3d01875b-7494-40bd-927a-18663de07fb2" />


### References

1. [Laravel](https://laravel.com/docs/12.x/routing)
2. [Laravel Permission](https://spatie.be/docs/laravel-permission/v6/basic-usage/role-permissions)
3. [Laravel Media Library](https://spatie.be/docs/laravel-medialibrary/v11/basic-usage/associating-files)
4. [Inertia JS](https://inertiajs.com/pages)
5. [Tailwind CSS](https://tailwindcss.com/docs/flex)
6. [ShadCn](https://ui.shadcn.com/docs/components)
7. [Yoopta](https://yoopta.dev/examples/withBaseFullSetup)
