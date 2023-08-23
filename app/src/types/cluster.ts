import Supercluster from "supercluster";

export type Cluster =
  | Supercluster.ClusterFeature<Supercluster.AnyProps>
  | Supercluster.PointFeature<Supercluster.AnyProps>;
