<?php

namespace Sawmainek\Apitoolz\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResponseLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        if( \Str::startsWith($request->path(), 'api/')) {
            \Log::info("[Response]  {$request->method()}::/{$request->path()} >>",[
                'request_id'=>$request->header()['x-request-id'][0] ?? "",
                'user_id' => $request->user()->id ?? null,
                'code'=> $response->status(),
                'response' => json_decode($response->content())
            ]);
        }

        return $response;
    }
}
