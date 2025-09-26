<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class FormSubmissionField extends Pivot
{
    protected $table = 'form_fields_submissions';

    protected function casts(): array
    {
        return [
            'value' => 'json:unicode',
        ];
    }
}
