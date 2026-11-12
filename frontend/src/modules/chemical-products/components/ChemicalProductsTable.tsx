import { Link } from 'react-router';
import { Pencil, Search, Trash2 } from 'lucide-react';
import type { ChemicalProduct } from '@/modules/chemical-products/models/chemicalProduct';
import DataTable, {
  type DataTableColumn,
} from '@/shared/components/data-display/DataTable';
import ConfirmDialog from '@/shared/components/feedback/ConfirmDialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface ChemicalProductsTableProps {
  deleting: boolean;
  products: ChemicalProduct[];
  totalProducts: number;
  search: string;
  onSearchChange: (value: string) => void;
  productToDelete: ChemicalProduct | null;
  onDeleteRequest: (product: ChemicalProduct) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}

function ChemicalProductsTable({
  deleting,
  products,
  totalProducts,
  search,
  onSearchChange,
  productToDelete,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: ChemicalProductsTableProps) {
  const columns: DataTableColumn<ChemicalProduct>[] = [
    {
      key: 'nome',
      header: 'Produto',
      render: (product) => (
        <div>
          <span className="block font-medium">{product.nome}</span>
          {product.descricao && (
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {product.descricao}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'classeRisco',
      header: 'Classe de risco ONU',
      render: (product) => `Classe ${product.classeRisco}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => (
        <Badge
          variant="outline"
          className={
            product.status
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-border bg-muted text-muted-foreground'
          }
        >
          <span
            className="size-1.5 rounded-full bg-current"
            aria-hidden="true"
          />
          {product.status ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (product) => (
        <div className="flex justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${product.nome}`}
          >
            <Link to={`/produtos/${product.id}/editar`}>
              <Pencil aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Excluir ${product.nome}`}
            onClick={() => onDeleteRequest(product)}
          >
            <Trash2 className="text-destructive" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Produtos cadastrados"
        description="Consulte e gerencie os produtos químicos do terminal."
        rows={products}
        columns={columns}
        getRowKey={(product) => product.id}
        minWidth="680px"
        emptyMessage={`Nenhum produto encontrado para “${search}”.`}
        toolbar={
          <div className="relative sm:w-72">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-label="Buscar produtos"
              placeholder="Buscar por nome ou classe..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-9 bg-background pl-9"
            />
          </div>
        }
        footer={
          <span>
            Exibindo {products.length} de {totalProducts} produtos
          </span>
        }
      />
      <ConfirmDialog
        open={productToDelete !== null}
        title="Excluir produto químico?"
        description={`O produto ${productToDelete?.nome ?? ''} será removido da lista. Esta ação não pode ser desfeita.`}
        pending={deleting}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir produto'}
        onOpenChange={(open) => {
          if (!open) onDeleteCancel();
        }}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}

export default ChemicalProductsTable;
