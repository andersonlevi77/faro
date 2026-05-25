<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Comprobante de alquiler {{ $alquiler->codigo }}</title>
        <style>
            @page {
                size: letter;
                margin: 12mm;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                color: #111827;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                background: #f3f4f6;
            }

            .document {
                width: 100%;
                max-width: 216mm;
                margin: 0 auto;
                padding: 10px;
                background: #fff;
            }

            .toolbar {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-bottom: 10px;
            }

            .toolbar button {
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 12px;
                cursor: pointer;
                background: #fff;
            }

            .sheet {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                padding: 14px;
            }

            .header {
                display: grid;
                grid-template-columns: 1.2fr 1fr;
                gap: 16px;
                align-items: start;
                margin-bottom: 12px;
            }

            .brand {
                display: flex;
                gap: 14px;
                align-items: center;
            }

            .brand img {
                width: 100px;
                height: auto;
                object-fit: contain;
            }

            .brand h1,
            .brand p,
            .meta h2,
            .meta p,
            .box p,
            .summary p,
            .totals p {
                margin: 0;
            }

            .brand h1,
            .meta h2 {
                font-size: 18px;
                margin-bottom: 4px;
            }

            .muted {
                color: #4b5563;
            }

            .meta {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                padding: 10px 12px;
            }

            .meta-grid,
            .box-grid,
            .summary-grid {
                display: grid;
                gap: 10px;
            }

            .meta-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                margin-top: 8px;
            }

            .section {
                margin-top: 12px;
            }

            .box {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                padding: 10px 12px;
            }

            .box-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .label {
                font-size: 10px;
                font-weight: 700;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: .04em;
                margin-bottom: 3px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            .lines-table,
            .payments-table {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                overflow: hidden;
            }

            th,
            td {
                border: 1px solid #d1d5db;
                padding: 7px 8px;
                vertical-align: top;
            }

            th {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: .03em;
                background: #f9fafb;
            }

            .text-right {
                text-align: right;
            }

            .text-center {
                text-align: center;
            }

            .summary-grid {
                grid-template-columns: 1.2fr .8fr;
                align-items: start;
            }

            .summary {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                padding: 12px;
            }

            .totals {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                padding: 12px;
            }

            .totals-row {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                padding: 5px 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .totals-row:last-child {
                border-bottom: 0;
            }

            .totals-row.total {
                font-weight: 700;
                font-size: 14px;
            }

            .signature-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 18px;
                margin-top: 22px;
            }

            .signature {
                padding-top: 28px;
                border-top: 1px solid #9ca3af;
                text-align: center;
            }

            @media print {
                body {
                    background: #fff;
                }

                .toolbar {
                    display: none;
                }

                .document {
                    padding: 0;
                }

                .sheet {
                    border: 0;
                    border-radius: 0;
                    padding: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="document">
            <div class="toolbar">
                <button type="button" onclick="window.print()">Imprimir</button>
                <button type="button" onclick="window.close()">Cerrar</button>
            </div>

            <div class="sheet">
                <div class="header">
                    <div class="brand">
                        <img src="{{ asset('logo.jpeg') }}" alt="Logo {{ config('app.name') }}">
                        <div>
                            <h1>{{ config('app.name', 'Construnor') }}</h1>
                            <p class="muted">Gestión de alquileres</p>
                            <p class="muted">Comprobante para entrega al cliente.</p>
                        </div>
                    </div>

                    <div class="meta">
                        <h2>Comprobante de alquiler</h2>
                        <p class="muted">Documento interno para respaldo comercial.</p>
                        <div class="meta-grid">
                            <div>
                                <p class="label">Serie</p>
                                <p>ALQ</p>
                            </div>
                            <div>
                                <p class="label">Número</p>
                                <p>{{ $alquiler->codigo }}</p>
                            </div>
                            <div>
                                <p class="label">Fecha de emisión</p>
                                <p>{{ $alquiler->created_at?->format('d/m/Y H:i') }}</p>
                            </div>
                            <div>
                                <p class="label">Estado</p>
                                <p>{{ $estadoLabel }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section box-grid">
                    <div class="box">
                        <p class="label">Datos del cliente</p>
                        <p><strong>{{ $alquiler->cliente?->nombre ?? 'Consumidor final' }}</strong></p>
                        <p class="muted">Código: {{ $alquiler->cliente?->codigo ?? '—' }}</p>
                        <p class="muted">Documento: {{ $alquiler->cliente?->documento ?? 'CF' }}</p>
                        <p class="muted">Email: {{ $alquiler->cliente?->email ?? '—' }}</p>
                        <p class="muted">Teléfono: {{ $alquiler->cliente?->telefono ?? '—' }}</p>
                    </div>

                    <div class="box">
                        <p class="label">Datos del contrato</p>
                        <p><strong>Período:</strong> {{ $alquiler->fecha_inicio_prevista?->format('d/m/Y') }} al {{ $alquiler->fecha_fin_prevista?->format('d/m/Y') }}</p>
                        <p class="muted">Entrega: {{ $alquiler->fecha_entrega_at?->format('d/m/Y H:i') ?? 'Pendiente' }}</p>
                        <p class="muted">Devolución: {{ $alquiler->fecha_devolucion_at?->format('d/m/Y H:i') ?? 'Pendiente' }}</p>
                        <p class="muted">Creado por: {{ $alquiler->usuario?->name ?? '—' }}</p>
                    </div>
                </div>

                <div class="section">
                    <table class="lines-table">
                        <thead>
                            <tr>
                                <th style="width: 42px;">Pos.</th>
                                <th style="width: 72px;">Tipo</th>
                                <th style="width: 64px;">Cantidad</th>
                                <th style="width: 58px;">Días</th>
                                <th>Descripción</th>
                                <th style="width: 90px;">Precio / día</th>
                                <th style="width: 96px;">Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($alquiler->lineas as $index => $linea)
                                <tr>
                                    <td class="text-center">{{ $index + 1 }}</td>
                                    <td class="text-center">{{ $linea->paquete ? 'Paquete' : 'Producto' }}</td>
                                    <td class="text-center">{{ (int) (float) $linea->cantidad }}</td>
                                    <td class="text-center">{{ $linea->dias }}</td>
                                    <td>
                                        <strong>{{ $linea->paquete?->nombre ?? $linea->producto?->nombre }}</strong><br>
                                        <span class="muted">
                                            Código: {{ $linea->paquete?->codigo ?? $linea->producto?->codigo ?? '—' }}
                                        </span>
                                    </td>
                                    <td class="text-right">Q {{ number_format((float) $linea->precio_diario, 2) }}</td>
                                    <td class="text-right">Q {{ number_format((float) $linea->subtotal, 2) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                <div class="section summary-grid">
                    <div class="summary">
                        <p class="label">Observaciones</p>
                        <p>{{ $alquiler->notas ?: 'Sin observaciones registradas para este alquiler.' }}</p>

                        @if ($alquiler->pagos->isNotEmpty())
                            <div style="margin-top: 14px;">
                                <p class="label">Pagos registrados</p>
                                <table class="payments-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Tipo</th>
                                            <th>Método</th>
                                            <th class="text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach ($alquiler->pagos as $pago)
                                            <tr>
                                                <td>{{ $pago->created_at?->format('d/m/Y H:i') }}</td>
                                                <td>{{ $pago->tipo->etiqueta() }}</td>
                                                <td>{{ $pago->metodo_pago->etiqueta() }}</td>
                                                <td class="text-right">Q {{ number_format((float) $pago->monto, 2) }}</td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        @endif
                    </div>

                    <div class="totals">
                        <div class="totals-row">
                            <p>Total alquiler</p>
                            <p>Q {{ number_format((float) $resumen['total_alquiler'], 2) }}</p>
                        </div>
                        <div class="totals-row">
                            <p>Garantía</p>
                            <p>Q {{ number_format((float) $resumen['deposito'], 2) }}</p>
                        </div>
                        <div class="totals-row">
                            <p>Cobrado</p>
                            <p>Q {{ number_format((float) $resumen['total_cobrado'], 2) }}</p>
                        </div>
                        <div class="totals-row">
                            <p>Devuelto</p>
                            <p>Q {{ number_format((float) $resumen['total_devuelto'], 2) }}</p>
                        </div>
                        <div class="totals-row total">
                            <p>Saldo pendiente</p>
                            <p>Q {{ number_format((float) $resumen['saldo_pendiente'], 2) }}</p>
                        </div>
                    </div>
                </div>

                <div class="signature-grid">
                    <div class="signature">
                        Firma de entrega / cliente
                    </div>
                    <div class="signature">
                        Firma de recepción / empresa
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
