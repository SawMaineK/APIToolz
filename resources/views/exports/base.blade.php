<table border="1">
    <thead>
        <tr>
            @foreach($info['config']['grid'] as $grid)
            <th style="background:#BE1616; color:#FFFFFF;">{{$grid['label']}}</th>
            @endforeach
        </tr>
    </thead>
    <tbody>
        @foreach($data as $row)
        <tr>
            @foreach($info['config']['grid'] as $grid)
            <td>{{$row[$grid['field']]}}</td>
            @endforeach
        </tr>
        @endforeach
    </tbody>
</table>